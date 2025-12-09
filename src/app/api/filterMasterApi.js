import { masterApi } from './masterApi';

export const filterMasterApi = async () => {
    return masterApi('getMasterData');
};