import imageCompression from 'browser-image-compression';


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

export const autoScrollToRestoredTarget = ({
    targetId,
    scrollY,
    dataAttr = 'data-product-id',
    maxAttempts = 40,
    block = 'start',
    behavior = 'auto',
} = {}) => {
    if (typeof window === 'undefined') return () => { };

    const resolvedTargetId = targetId != null ? String(targetId) : null;
    const resolvedScrollY = Number.isFinite(Number(scrollY)) && Number(scrollY) >= 0 ? Number(scrollY) : null;
    let attempts = 0;
    let cancelled = false;

    const findEl = () => {
        if (!resolvedTargetId || typeof document === 'undefined') return null;
        const escaped = (window?.CSS?.escape)
            ? window.CSS.escape(resolvedTargetId)
            : resolvedTargetId.replace(/"/g, '\\"');
        return document.querySelector(`[${dataAttr}="${escaped}"]`);
    };

    const step = () => {
        if (cancelled) return;
        attempts += 1;

        const el = findEl();
        if (el) {
            el.scrollIntoView({ behavior, block, inline: 'nearest' });
            return;
        }

        if (attempts >= maxAttempts) {
            if (resolvedScrollY != null) {
                window.scrollTo({ top: resolvedScrollY, behavior });
            }
            return;
        }

        requestAnimationFrame(step);
    };

    requestAnimationFrame(() => requestAnimationFrame(step));

    return () => {
        cancelled = true;
    };
};

export async function compressImagesToWebP(files, customOptions = {}) {
    const inputFiles = Array.isArray(files) ? files : [files];

    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
        ...customOptions,
    };

    const results = [];

    for (const file of inputFiles) {
        if (!file?.type?.startsWith("image/")) continue;

        const compressedFile = await imageCompression(file, options);

        results.push({
            id: `${file.name}-${Date.now()}`,
            originalName: file.name,
            originalSize: file.size,
            compressedName:
                file.name.replace(/\.[^/.]+$/, "") + ".webp",
            compressedSize: compressedFile.size,
            blob: compressedFile,
            previewUrl: URL.createObjectURL(compressedFile),
        });
    }

    return results;
}

export const isSafariBrowser = () => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('safari') > -1 && ua.indexOf('chrome') === -1;
};

/**
 * Smoothly scrolls to a section and highlights it temporarily
 * @param {string} sectionId - The ID of the section to scroll to
 * @param {number} offset - Optional offset from the top (default: 80px for header)
 */
export const scrollToSectionWithHighlight = (sectionId, offset = 80) => {
    if (typeof window === 'undefined') return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    // Calculate position with offset
    const elementPosition = section.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    // Smooth scroll to section
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });

    // Add highlight class after scroll completes
    setTimeout(() => {
        section.classList.add('section-highlight-active');

        // Remove highlight after animation completes
        setTimeout(() => {
            section.classList.remove('section-highlight-active');
        }, 3000); // 3 seconds total highlight duration
    }, 500); // Wait for scroll to complete
};