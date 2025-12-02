import { CommonAPI } from "./config/CommonApi";

export const addToStockPurchaseApi = async (cartItems) => {
    try {
        // Transform cart items to the expected format for stock purchase
        const itemsData = cartItems.map(item => ({
            design_no: item.design_no || item.name,
            image: item.image,
            quantity: item.quantity || 1,
            price: item.price || 0,
            dwt: item.dwt,
            cwt: item.cwt,
            gwt: item.gwt,
            purchase_type: "stock"
        }));

        const body = {
            "con": JSON.stringify({
                "id": "",
                "mode": "addToStockPurchase",
                "appuserid": "maitri@eg.com",
                "FormName": "StockPurchase",
                "items": itemsData,
                "total_items": itemsData.length,
                "request_date": new Date().toISOString()
            }),
            "p": JSON.stringify({}),
            "f": "m-test2.orail.co.in (StockPurchase)",
        };

        const response = await CommonAPI(body);

        if (response?.success) {
            return {
                success: true,
                message: response.message || "Stock purchase request created successfully",
                data: response.data,
                request_id: response.request_id
            };
        } else {
            throw new Error(response?.message || "This Events is Comming Soon...");
            // throw new Error(response?.message || "Failed to create stock purchase request");
        }
    } catch (error) {
        console.error('Add to Stock Purchase API Error:', error);
        throw error;
    }
};