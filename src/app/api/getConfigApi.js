import { masterApi } from './masterApi';

export const getConfigFlagApi = async () => {
    return masterApi('GetConfigFlag', {
        p: '{}',
        f: "optigoai (GetConfigFlag)"
    });
};
