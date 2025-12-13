"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { designCollectionApi } from '@/app/api/designCollectionApi';

const ProductDataContext = createContext(undefined);

export const ProductDataProvider = ({ children }) => {
    const [productData, setProductData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProductData = useCallback(async (force = false) => {
        // If data already exists and not forcing refresh, return cached data
        if (productData && !force) {
            return productData;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await designCollectionApi();
            const allProducts = res?.rd || [];
            setProductData(allProducts);
            return allProducts;
        } catch (err) {
            console.error('Failed to fetch product data:', err);
            setError(err.message || 'Failed to load products');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [productData]);

    const clearProductData = useCallback(() => {
        setProductData(null);
        setError(null);
    }, []);

    const value = {
        productData,
        isLoading,
        error,
        fetchProductData,
        clearProductData,
    };

    return (
        <ProductDataContext.Provider value={value}>
            {children}
        </ProductDataContext.Provider>
    );
};

export const useProductData = () => {
    const context = useContext(ProductDataContext);
    if (context === undefined) {
        throw new Error('useProductData must be used within a ProductDataProvider');
    }
    return context;
};
