import { masterApi } from './masterApi';
import { uploadAiImage } from './uploadHelper';

/**
 * Saves AI Search Feedback (Like/Dislike)
 * 
 * @param {Object} options - Feedback options
 * @param {string} options.EventName - "TextSearch", "ImageSearch", or "HybridSearch"
 * @param {string} options.SearchText - The text searched (if any)
 * @param {string} [options.ImageUrl] - The URL of the uploaded search image (if any)
 * @param {File|Blob} [options.ImageFile] - The local image file/blob to upload (if any)
 * @param {string} [options.FileName] - Original filename
 * @param {string} options.IsLiked - "1" for like, "0" for dislike
 * @param {string} options.FeedbackID - Optional feedback ID for updates
 * @param {string} options.Comment - Optional feedback comment
 * @param {boolean} options.RemoveFeedback - Whether to remove this feedback
 * @returns {Promise<Object>} API response
 */
export const saveAiSearchFeedbackApi = async ({
    EventName,
    SearchText = "",
    ImageUrl = "",
    ImageFile = null,
    IsLiked = "0",
    FeedbackID = "",
    Comment = "",
    RemoveFeedback = false
}) => {
    // Only upload if NOT removing feedback
    let imageUrl = ImageUrl;
    if (!RemoveFeedback) {
        const uploadResult = await uploadAiImage({ ImageFile, ImageUrl });
        imageUrl = uploadResult.imageUrl;
    }

    return masterApi('SaveAiSearchResponse', {
        p: JSON.stringify({
            EventName,
            SearchText,
            ImageUrl: imageUrl,
            IsLiked,
            FeedbackID,
            Comment,
            RemoveFeedback
        }),
        f: "optigoai (SaveAiSearchResponse)"
    });
};
