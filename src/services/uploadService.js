/**
 * Service for uploading files to the external server
 */
export const uploadService = {
    /**
     * Uploads a file to the configured API
     * 
     * @param {File|Blob} file - The file to upload
     * @param {string} folderName - Folder name on server (e.g., 'Ticket')
     * @param {string} uKey - User key
     * @param {string} uniqueNo - A unique identifier for the upload
     * @returns {Promise<string|null>} - The URL of the uploaded file or null on failure
     */

    uploadFile: async (file, folderName = 'OptiogoAiSearch', uKey = 'orail25TNBVD0LO2UFPRZ4YH_Image', uniqueNo = crypto.randomUUID()) => {
        try {
            const localHostnames = (process.env.NEXT_PUBLIC_LOCAL_HOSTNAMES || "localhost,nzen,optigoai.web").split(',').map(h => h.trim().toLowerCase());
            const currentHost = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : "";
            const isLocal = localHostnames.includes(currentHost);
            const apiUrl = isLocal ? process.env.NEXT_PUBLIC_LOCALUPLOAD_API_URL : process.env.NEXT_PUBLIC_LIVEUPLOAD_API_URL;

            const formData = new FormData();

            // Ensure filename is provided if file is a Blob (otherwise extension is lost)
            const fileName = (file instanceof File) ? file.name : `image_${Date.now()}.webp`;
            formData.append('fileType', file, fileName);
            formData.append('folderName', folderName);
            formData.append('uKey', uKey);
            formData.append('uniqueNo', uniqueNo);

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.files && result.files.length > 0) {
                return result.files[0];
            } else {
                console.error("Upload API returned failure:", result.message);
                return null;
            }
        } catch (error) {
            console.error("Error in uploadFile service:", error);
            return null;
        }
    }
};
