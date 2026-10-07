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
    let temp = Array.isArray(baseDataset) ? baseDataset : [];
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
                // If the filter is a range filter
                if (items[0]?.isRange) {
                    const { min, max } = items[0];
                    const val = Number(product[category]);
                    return val >= min && val <= max;
                }

                return items.some((item) => {
                    const categoryLower = category.toLowerCase();
                    let productKey = CATEGORY_FIELD_MAP[categoryLower];

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

    if (debouncedSearchTerm.trim() && debouncedSearchTerm.trim().length >= 2) {
        const term = debouncedSearchTerm.trim().toLowerCase();

        const matchedItems = [];

        temp.forEach(product => {
            let priority = -1;

            const designNo = (product.designno || '').toLowerCase();

            if (designNo.startsWith(term)) {
                priority = 2;
            } else if (designNo.includes(term)) {
                priority = 0;
            }
            if (priority < 2) {
                const textFields = [
                    'categoryname', 'subcategoryname', 'collectionname', 'producttype',
                    'brandname', 'labname', 'occasionname', 'stylename', 'gendername',
                    'diamondshape', 'metaltype', 'metalcolor'
                ];

                const hasStartMatch = textFields.some(field =>
                    (product[field] || '').toLowerCase().startsWith(term)
                );

                if (hasStartMatch) {
                    priority = Math.max(priority, 1);
                }
            }

            if (priority > -1) {
                matchedItems.push({ product, priority });
            }
        });
        matchedItems.sort((a, b) => b.priority - a.priority);
        temp = matchedItems.map(i => i.product);
    }

    return temp;
}

const LOCAL_SEARCH_FIELDS = [
    'categoryname', 'subcategoryname', 'collectionname', 'producttype',
    'brandname', 'labname', 'occasionname', 'stylename', 'gendername',
    'diamondshape', 'metaltype', 'metalcolor'
];

/**
 * Local catalog matcher — the keyword channel of the hybrid search.
 * Scores products against metadata fields the AI image index never saw
 * (design#, category, collection, metal, ...). Multi-token queries use
 * AND semantics: every token must hit at least one field.
 */
export function searchLocalCatalog(term = "", products = []) {
    const query = (term || "").trim().toLowerCase();
    if (query.length < 2 || !Array.isArray(products)) return [];

    const tokens = query.split(/\s+/).filter(Boolean);

    const fieldScore = (token, fieldValues) => {
        if (fieldValues.some((v) => v === token)) return 2;
        if (fieldValues.some((v) => v.startsWith(token))) return 1;
        if (fieldValues.some((v) => v.includes(token))) return 0.5;
        return 0;
    };

    return products
        .map((p) => {
            const designno = (p.designno || "").replace("#", "").toLowerCase();
            const autocode = (p.autocode || "").toLowerCase();
            const fieldValues = LOCAL_SEARCH_FIELDS.map((f) => (p[f] || "").toLowerCase());

            let score = 0;
            if (designno === query || autocode === query) {
                score = 100;
            } else if (designno.startsWith(query) || autocode.startsWith(query)) {
                score = 50;
            } else {
                if (designno.includes(query) || autocode.includes(query)) score += 10;
                for (const token of tokens) {
                    const s = Math.max(
                        fieldScore(token, fieldValues),
                        designno.includes(token) || autocode.includes(token) ? 0.5 : 0
                    );
                    if (s === 0) { score = 0; break; }
                    score += s;
                }
            }
            return { product: p, score };
        })
        .filter((i) => i.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((i) => i.product);
}

/**
 * Fuses local catalog matches with AI visual matches.
 * Local matches come first (metadata intent is explicit),
 * AI results follow — deduped by designno/autocode/id.
 */
export function mergeSearchResults(localMatches = [], aiMatches = []) {
    const seen = new Set();
    const merged = [];
    for (const p of [...localMatches, ...aiMatches]) {
        const key = (p.designno || p.autocode || p.id || "").toString().toLowerCase();
        if (key) {
            if (seen.has(key)) continue;
            seen.add(key);
        }
        merged.push(p);
    }
    return merged;
}

export function createSearchChip(searchData, isError = false) {
    let chip = null;
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
                imageFile: (typeof searchData.image !== 'string') ? searchData.image : null,
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
                imageFile: (typeof searchData.image !== 'string') ? searchData.image : null,
                text: searchData.text?.trim(),
                error: isError
            },
        };
    }
    return chip;
}
