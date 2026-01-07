import { masterApi } from './masterApi';

/**
 * Saves AI Search Feedback (Like/Dislike)
 * 
 * @param {Object} options - Feedback options
 * @param {string} options.EventName - "TextSearch", "ImageSearch", or "HybridSearch"
 * @param {string} options.SearchText - The text searched (if any)
 * @param {string} options.ImageUrl - The URL of the uploaded search image (if any)
 * @param {string} options.IsLiked - "1" for like, "0" for dislike
 * @param {string} options.Comment - Optional feedback comment
 * @returns {Promise<Object>} API response
 */
export const saveAiSearchFeedbackApi = async ({
    EventName,
    SearchText = "",
    ImageUrl = "",
    IsLiked = "0",
    Comment = ""
}) => {
    return masterApi('SaveAiSearchResponse', {
        p: JSON.stringify({
            EventName,
            SearchText,
            ImageUrl,
            IsLiked,
            Comment
        }),
        f: "m-test2.orail.co.in (ConversionDetail)"
    });
};
