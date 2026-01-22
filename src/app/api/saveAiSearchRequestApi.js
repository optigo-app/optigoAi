import { masterApi } from './masterApi';
import { uploadAiImage } from './uploadHelper';

/**
 * Saves AI Search Request
 * 
 * @param {Object} options - Search options
 * @param {string} options.EventName - "TextSearch", "ImageSearch", or "HybridSearch"
 * @param {string} options.SearchText - The text searched (if any)
 * @param {string} [options.ImageUrl] - The URL of the uploaded search image (if any)
 * @param {File|Blob} [options.ImageFile] - The local image file/blob to upload (if any)
 * @param {string} [options.FileName] - Original filename
 * @param {string} options.IsSuccess - "1" for success, "0" for failure
 * @returns {Promise<Object>} API response
 */
export const saveAiSearchRequestApi = async ({
    EventName,
    SearchText = "",
    ImageUrl = "",
    ImageFile = null,
    IsSuccess = "0",
}) => {
    const { imageUrl } = await uploadAiImage({ ImageFile, ImageUrl });

    return masterApi('SaveAiSearchRequest', {
        p: JSON.stringify({
            EventName,
            SearchText,
            ImageUrl: imageUrl,
            IsSuccess,
        }),
        f: "optigoai (SaveAiSearchRequest)"
    });
};
