export const isFrontendFeRoute = (urlParamsFlag) => {
    return urlParamsFlag && urlParamsFlag.toLowerCase() === 'fe';
};
