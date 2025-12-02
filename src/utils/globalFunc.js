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


