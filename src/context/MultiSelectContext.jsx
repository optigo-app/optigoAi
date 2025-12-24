'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const MultiSelectContext = createContext(undefined);

export function MultiSelectProvider({ children }) {
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());

    const toggleMultiSelectMode = useCallback(() => {
        setIsMultiSelectMode(prev => {
            // Clear selections when exiting multi-select mode
            if (prev) {
                setSelectedProductIds(new Set());
            }
            return !prev;
        });
    }, []);

    const toggleProductSelection = useCallback((productId) => {
        setSelectedProductIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    }, []);

    const selectAll = useCallback((productIds) => {
        setSelectedProductIds(new Set(productIds));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedProductIds(new Set());
    }, []);

    const isProductSelected = useCallback((productId) => {
        return selectedProductIds.has(productId);
    }, [selectedProductIds]);

    const selectBatch = useCallback((productIds) => {
        setSelectedProductIds(prev => {
            const newSet = new Set(prev);
            productIds.forEach(id => newSet.add(id));
            return newSet;
        });
    }, []);

    const deselectBatch = useCallback((productIds) => {
        setSelectedProductIds(prev => {
            const newSet = new Set(prev);
            productIds.forEach(id => newSet.delete(id));
            return newSet;
        });
    }, []);

    const getSelectedProducts = useCallback((allProducts) => {
        return allProducts.filter(product => selectedProductIds.has(product.id));
    }, [selectedProductIds]);

    const selectedCount = useMemo(() => selectedProductIds.size, [selectedProductIds]);

    const value = useMemo(() => ({
        isMultiSelectMode,
        selectedProductIds,
        selectedCount,
        toggleMultiSelectMode,
        toggleProductSelection,
        selectAll,
        selectBatch,
        deselectBatch,
        clearSelection,
        isProductSelected,
        getSelectedProducts,
    }), [
        isMultiSelectMode,
        selectedProductIds,
        selectedCount,
        toggleMultiSelectMode,
        toggleProductSelection,
        selectAll,
        selectBatch,
        deselectBatch,
        clearSelection,
        isProductSelected,
        getSelectedProducts,
    ]);

    return (
        <MultiSelectContext.Provider value={value}>
            {children}
        </MultiSelectContext.Provider>
    );
}

export function useMultiSelect() {
    const context = useContext(MultiSelectContext);
    if (context === undefined) {
        throw new Error('useMultiSelect must be used within a MultiSelectProvider');
    }
    return context;
}
