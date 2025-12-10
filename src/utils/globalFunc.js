

export const getAuthData = () => {
    try {
        const authData = localStorage.getItem("AuthqueryParams") || sessionStorage.getItem("AuthqueryParams");
        return authData ? JSON.parse(authData) : null;
    } catch (error) {
        console.error("Error parsing AuthData:", error);
        return null;
    }
};

export const formatMasterData = (data) => {
    if (!data) return [];

    const formatted = [];

    Object.keys(data).forEach(key => {
        const arr = data[key];

        if (Array.isArray(arr) && arr.length > 0) {
            formatted.push({
                name: arr[0].Master_Name,
                expanded: false,
                items: arr.map(item => ({
                    id: item.id,
                    code: item.Code,
                    name: item.Name,
                    displayOrder: item.DisplayOrder
                }))
            });
        }
    });

    return formatted;
};


export function buildQuoteRedirectUrl(designsId, curVersion) {
    const urlParams = new URLSearchParams(window.location.search);
    const parentBase = urlParams.get('parentBase');

    let baseUrl;
    if (parentBase) {
        baseUrl = parentBase;
    } else if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
        baseUrl = `${window.location.ancestorOrigins[0]}/${curVersion}`;
    } else {
        const { origin, pathname } = window.location;
        const pathSegments = pathname.split('/').filter(Boolean);
        const basePath = pathSegments.length > 0 ? `/${pathSegments[0]}` : "";
        baseUrl = `${origin}${basePath}`;
    }

    return `${baseUrl}/salescrm/app/JobManagement_QuickOrderProcess_QuoteSale_ForSpeed1` +
        `?encoded=1` +
        `&IsAlbumEcomOther=0` +
        `&DesignsIds=${designsId}` +
        `&QueryStringid=${designsId}` +
        `&isstockbasedorder=` +
        `&isForQuote=true` +
        `&mode=Like` +
        `&isFromCallPage=` +
        `&customerid=` +
        `&hdnmergeskunolist=` +
        `&ifid=Quotation` +
        `&pid=undefined`;
}

// export function buildQuoteRedirectUrl(designsId, curVersion) {
//     const urlParams = new URLSearchParams(window.location.search);
//     const parentBase = urlParams.get('parentBase');

//     let baseUrl;
//     if (parentBase) {
//         baseUrl = parentBase;
//     } else if (window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0) {
//         baseUrl = `${window.location.ancestorOrigins[0]}/${curVersion}`;
//     } else {
//         const { origin, pathname } = window.location;
//         const pathSegments = pathname.split('/').filter(Boolean);
//         const basePath = pathSegments.length > 0 ? `/${pathSegments[0]}` : "";
//         baseUrl = `${origin}${basePath}`;
//     }

//     return `${baseUrl}/myapp/app/RedirectFromNextJs.aspx`
// }



export const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // base64 string
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

export const base64ToFile = (base64String, fileName) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
};

export const getClientIpAddress = async () => {
    try {
        const cachedIp = sessionStorage.getItem("clientIpAddress");
        if (cachedIp) return cachedIp;

        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        const ip = data?.ip || "";

        sessionStorage.setItem("clientIpAddress", ip);
        return ip;
    } catch (error) {
        console.error("Error fetching IP address:", error);
        return "";
    }
};

export const getMatchedDesignCollections = (res = [], allDesignCollections = []) => {
    if (!Array.isArray(res) || !Array.isArray(allDesignCollections)) return [];
    const designMatchMap = {};
    for (const item of res) {
        const base = (item.sku || "").split("~")[0].trim().toLowerCase();
        const percent = Number(item.match_percent) || 0;
        if (!designMatchMap[base] || designMatchMap[base] < percent) {
            designMatchMap[base] = percent;
        }
    }
    const matched = allDesignCollections
        .map((p) => {
            const designno = (p.designno || "").replace("#", "").trim().toLowerCase();
            const autocode = (p.autocode || "").trim().toLowerCase();

            const matchPercent = designMatchMap[designno] || designMatchMap[autocode] || 0;

            return {
                ...p,
                _matchPercent: matchPercent,
            };
        })
        .filter((p) => p._matchPercent > 0);

    matched.sort((a, b) => b._matchPercent - a._matchPercent);

    return matched.map((p) => {
        const { _matchPercent, ...rest } = p;
        return rest;
    });
};