import Fuse from "fuse.js";

export const CATEGORY_FIELD_MAP = {
    'category': 'categoryname',
    'subcategory': 'subcategoryname',
    'collection': 'collectionname',
    'product type': 'producttype',
    'type': 'producttype',
    'brand': 'brandname',
    'gender': 'gendername',
    'style': 'stylename',
    'occasion': 'occasionname',
    'lab': 'labname',
    'metal color': 'metalcolor',
    'metal': 'metaltype',
    'metal type': 'metaltype',
    'diamond shape': 'diamondshape',
    'shape': 'diamondshape',
    'design#': 'designno',
    'designno': 'designno'
};

export function getMatchedDesignCollections(res = [], allDesignCollections = []) {
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
}

export function filterProducts(baseDataset, appliedFilters, debouncedSearchTerm) {
    let temp = baseDataset;
    // Apply drawer filters (exclude search chips)
    const drawerFilters = appliedFilters.filter(
        (f) => !(f && f.item && ["text-search", "image-search", "hybrid-search"].includes(f.item.id))
    );
    if (drawerFilters.length > 0) {
        const filtersByCategory = drawerFilters.reduce((acc, { category, item }) => {
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {});

        temp = temp.filter((product) => {
            return Object.entries(filtersByCategory).every(([category, items]) => {
                return items.some((item) => {
                    const categoryLower = category.toLowerCase();
                    let productKey = CATEGORY_FIELD_MAP[categoryLower];

                    // Fallback: try to find a partial match if exact match fails
                    if (!productKey) {
                        const match = Object.keys(CATEGORY_FIELD_MAP).find(key => categoryLower.includes(key));
                        if (match) productKey = CATEGORY_FIELD_MAP[match];
                    }

                    const fieldValue = productKey ? product[productKey] : "";
                    const fieldValueLower = (fieldValue || "").toLowerCase();
                    const itemNameLower = (item.name || "").toLowerCase();

                    return (
                        fieldValueLower === itemNameLower ||
                        product.MasterManagement_DiamondStoneTypeid === item.id
                    );
                });
            });
        });
    }

    // Apply search filter (only for terms with 2+ characters)
    if (debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= 2) {
        const fuse = new Fuse(temp, {
            keys: [
                'autocode', 'designno', 'categoryname', 'subcategoryname',
                'collectionname', 'producttype', 'brandname', 'labname', 'occassionname', 'stylename', 'gendername', 'diamondshape', 'metaltype', 'metalcolor'
            ],
            threshold: 0.15,
            distance: 100,
            minMatchCharLength: 2,
            ignoreLocation: true,
            useExtendedSearch: false,
            includeScore: true
        });
        const results = fuse.search(debouncedSearchTerm.trim());
        temp = results.map(result => result.item);
    }

    return temp;
}

export function createSearchChip(searchData, isError = false) {
    let chip = null;
    // Helper to safely get image URL
    const getImageUrl = (image) => {
        if (!image) return null;
        if (typeof image === 'string') return image;
        try {
            return URL.createObjectURL(image);
        } catch (e) {
            console.error("Error creating object URL", e);
            return null;
        }
    };

    if (searchData?.isSearchFlag === 1) {
        chip = {
            category: "Text",
            item: {
                id: "text-search",
                name: searchData.text?.trim() || "",
                error: isError
            },
        };
    } else if (searchData?.isSearchFlag === 2) {
        const imageUrl = getImageUrl(searchData.image);
        chip = {
            category: "Image",
            item: {
                id: "image-search",
                name: "Image Search",
                icon: true,
                imageUrl: imageUrl,
                error: isError
            },
        };
    } else if (searchData?.isSearchFlag === 3) {
        const imageUrl = getImageUrl(searchData.image);
        chip = {
            category: "Hybrid",
            item: {
                id: "hybrid-search",
                name: searchData.text?.trim() || "Hybrid Search",
                imageUrl: imageUrl,
                text: searchData.text?.trim(),
                error: isError
            },
        };
    }
    return chip;
}
