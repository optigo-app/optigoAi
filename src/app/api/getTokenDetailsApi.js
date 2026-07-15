import { getAuthData } from '@/utils/globalFunc';
import { masterApi } from './masterApi';

/**
 * Fetches AI search token details (total and used) for the current user.
 *
 * @returns {Promise<{totalToken: number, tokenUsed: number} | null>}
 */
export const getTokenDetailsApi = async () => {
    try {
        const response = await masterApi('getTokenDetails', {
            p: '',
            f: 'airis (getTokenDetails)',
        });

        const rd = response?.rd;
        if (Array.isArray(rd) && rd.length > 0) {
            return {
                totalToken: rd[0].TotalToken ?? 0,
                tokenUsed: rd[0].TokenUsed ?? 0,
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching token details:', error);
        return null;
    }
};
