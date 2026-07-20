const defaultLocalHosts = "localhost,nzen,optigoai.web";

const LOCAL_HOSTNAMES = (process.env.REACT_APP_LOCAL_HOSTNAMES || defaultLocalHosts)
    .split(',')
    .map(h => h.trim().toLowerCase());


const isBrowser = typeof window !== 'undefined';

const DOMAINS = {
    local: process.env.BACKEND_NZEN_API_URL || "http://newnextjs.web/api/report",
    live: process.env.BACKEND_LIVE_API_URL || "https://apilx.optigoapps.com/api/report",
};

const currentHost = isBrowser ? window.location.hostname.toLowerCase() : "";

const isLocal = isBrowser && LOCAL_HOSTNAMES.includes(currentHost);


export const APIURL = isLocal ? DOMAINS.local : DOMAINS.live;

const getAuthData = () => {
    if (!isBrowser) return null;

    try {
        const authData =
            sessionStorage.getItem("AuthqueryParams") ||
            localStorage.getItem("AuthqueryParams");

        return authData ? JSON.parse(authData) : null;
    } catch (error) {
        console.error("Error parsing AuthData:", error);
        return null;
    }
};

export const getHeaders = (init = {}) => {
    const AuthData = getAuthData();

    return {
        Authorization: `Bearer ${init.token || ""}`,
        Yearcode: AuthData?.yc ?? "e3tuemVufX17ezIwfX17e29yYWlsMjV9fXt7b3JhaWwyNX19",
        Version: AuthData?.cuver ?? init.version ?? "R50B3",
        sv: AuthData?.sv ?? "0",
        sp: "63",
    };
};
