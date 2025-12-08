import { useEffect, useState } from "react";

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


export const ContinuousTypewriter = ({ texts, delay = 0 }) => {
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(50);

    const textArray = Array.isArray(texts) ? texts : [texts];

    useEffect(() => {
        let timer;
        const handleType = () => {
            const current = loopNum % textArray.length;
            const fullText = textArray[current];

            setDisplayText(
                isDeleting
                    ? fullText.substring(0, displayText.length - 1)
                    : fullText.substring(0, displayText.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 50);

            if (!isDeleting && displayText === fullText) {
                setTimeout(() => setIsDeleting(true), 1600);
            } else if (isDeleting && displayText === "") {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, loopNum, typingSpeed, textArray]);

    return (
        <span style={{ borderRight: "2px solid #7367f0", paddingRight: "4px" }}>
            {displayText}
        </span>
    );
};
