import { getAuthData } from "@/utils/globalFunc";
import { CommonAPI } from "./config/CommonApi";

export const addToQuoteApi = async (cartItems) => {
    const AuthData = getAuthData();
    try {
        // Transform cart items to the expected format
        const productId = cartItems
            ?.map(item => item.id)
            .filter(Boolean)
            .join(',') || '';

        const combinedValue = JSON.stringify({
            QueryStringdesignid: productId ?? '',
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"SaveQueryStringdesignid\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"FormName\": \"AMaster\"}`,
            "f": "Task Management (login)",
            "p": combinedValue,
        };

        const response = await CommonAPI(body);

        if (response?.Data?.rd[0]?.MSG == "Success") {
            return {
                success: true,
                message: response.message || "Items added to design collection successfully",
                data: response.Data
            };
        } else {
            throw new Error(response?.message || "Failed to add items to design collection");
        }
    } catch (error) {
        console.error('Add to Design Collection API Error:', error);
        throw error;
    }
};