export const isFrontendFeRoute = () => {
    return typeof window !== "undefined" && sessionStorage.getItem("urlParams")?.toLowerCase() === "fe";
};
