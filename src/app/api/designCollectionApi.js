import { getAuthData } from "@/utils/globalFunc";
import { CommonAPI } from "./config/CommonApi";

export const designCollectionApi = async () => {
     const AuthData = getAuthData();
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"getdesigncollection\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"FormName\": \"AMaster\"}`,
            "p": "{}",
            "f": "m-test2.orail.co.in (DesignCollection)",
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};