import { masterApi } from './masterApi';

export const designCollectionApi = async () => {
    return masterApi('getdesigncollection');
};