import { uploadService } from '@/services/uploadService';
import { compressImagesToWebP } from '@/utils/globalFunc';

/**
 * Standardized helper for uploading AI Search related images.
 * Handles both local Files/Blobs and remote URLs (with proxy).
 * 
 * @param {Object} options
 * @param {File|Blob} [options.ImageFile] - Local image
 * @param {string} [options.ImageUrl] - Remote URL
 * @param {string} [options.FileName] - Original filename
 * @param {string} [options.folder] - Target folder on server
 * @returns {Promise<{ imageUrl: string, fileName: string }>}
 */
export const uploadAiImage = async ({ ImageFile, ImageUrl, FileName = "", folder = 'AiSearch' }) => {
    let finalImageUrl = ImageUrl || "";
    let finalFileName = FileName || "";

    try {
        const storedUKey = typeof window !== 'undefined' ? sessionStorage.getItem('ukey') : null;

        if (ImageFile && !ImageUrl) {
            const compressed = await compressImagesToWebP(ImageFile);
            if (compressed && compressed.length > 0) {
                const uploadResult = await uploadService.uploadFile(
                    compressed[0].blob,
                    folder,
                    storedUKey || undefined
                );
                if (uploadResult && uploadResult.url) {
                    finalImageUrl = uploadResult.fileName;
                    finalFileName = uploadResult.name || uploadResult.fileName || "";
                }
            }
        } else if (ImageUrl && (ImageUrl.startsWith('http') || ImageUrl.startsWith('https') || ImageUrl.startsWith('blob:'))) {
            const response = await fetch(ImageUrl);
            const blob = await response.blob();
            const file = new File([blob], "ai-image.webp", { type: "image/webp" });

            const compressed = await compressImagesToWebP(file);
            if (compressed && compressed.length > 0) {
                const uploadResult = await uploadService.uploadFile(
                    compressed[0].blob,
                    folder,
                    storedUKey || undefined
                );
                if (uploadResult && uploadResult.url) {
                    finalImageUrl = uploadResult.fileName;
                    finalFileName = uploadResult.name || uploadResult.fileName || "";
                }
            }
        }
    } catch (error) {
        console.error(`Error in uploadAiImage helper:`, error);
    }

    return { imageUrl: finalImageUrl, fileName: finalFileName };
};
