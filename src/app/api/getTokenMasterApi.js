import { masterApi } from './masterApi';

export const getTokenMasterApi = async () => {
    try {
        const response = await masterApi('getTokenMaster', {
            p: '',
            f: 'airis (getTokenMaster)',
        });

        const rd = response?.rd;
        if (Array.isArray(rd) && rd.length > 0) {
            const tokenMap = {};
            rd.forEach(item => {
                if (item.EventName) {
                    tokenMap[item.EventName] = item.TokenCount ?? 1;
                }
            });
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('tokenMaster', JSON.stringify(tokenMap));
            }
            return tokenMap;
        }

        return null;
    } catch (error) {
        console.error('Error fetching token master:', error);
        return null;
    }
};

export const getTokenCost = (eventName) => {
    if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('tokenMaster');
        if (stored) {
            try {
                const tokenMap = JSON.parse(stored);
                return tokenMap[eventName] ?? 1;
            } catch {
                return 1;
            }
        }
    }
    return 1;
};
