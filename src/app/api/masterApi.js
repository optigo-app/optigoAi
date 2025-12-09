import { getAuthData, getClientIpAddress } from "@/utils/globalFunc";
import { CommonAPI } from "./config/CommonApi";

export const masterApi = async (mode, options = {}) => {
    const { params = {}, p = "{}", f = "m-test2.orail.co.in (DesignCollection)" } = options;
    const AuthData = getAuthData();
    if (!AuthData || !AuthData.uid) {
        console.warn(`masterApi call skipped for mode '${mode}' due to missing AuthData.`);
        return [];
    }

    try {
        const ipAddress = await getClientIpAddress();

        const conPayload = {
            id: "",
            mode: mode,
            appuserid: AuthData.uid,
            FormName: "AMaster",
            IPAddress: ipAddress,
            ...params,
        };

        const body = {
            "con": JSON.stringify(conPayload),
            "p": p,
            "f": f,
        };

        const response = await CommonAPI(body);

        if (mode === 'SaveQueryStringdesignid') {
            if (response?.Data?.rd[0]?.MSG === "Success") {
                return { success: true, data: response.Data };
            } else {
                throw new Error(response?.message || "Failed to save cart items");
            }
        }

        return response?.Data || [];

    } catch (error) {
        console.error(`Error in masterApi call with mode '${mode}':`, error);
        return [];
    }
};
