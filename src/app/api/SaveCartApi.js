import { masterApi } from './masterApi';

export const SaveCartApi = async (cartItems) => {
    try {
        const productId = cartItems
            ?.map(item => item.id)
            .filter(Boolean)
            .join(',') || '';

        const pValue = JSON.stringify({
            QueryStringdesignid: productId ?? '',
        });

        const options = {
            p: pValue,
            f: "SaveQueryStringdesignid",
        };

        const result = await masterApi('SaveQueryStringdesignid', options);

        if (result.success) {
            return {
                success: true,
                message: "Items added to design collection successfully",
                data: result.data
            };
        }
        throw new Error("An unexpected error occurred.");

    } catch (error) {
        console.error('SaveCartApi Error:', error);
        throw error;
    }
};