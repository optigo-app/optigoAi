"use client";
import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { getTokenDetailsApi } from '@/app/api/getTokenDetailsApi';
import { getTokenCost } from '@/app/api/getTokenMasterApi';

const MAX_TOKENS = 100;

const TokenUsageContext = createContext(null);

export const TokenUsageProvider = ({ children }) => {
    const [usage, setUsage] = useState(0);
    const [maxTokens, setMaxTokens] = useState(MAX_TOKENS);
    const [isLoading, setIsLoading] = useState(false);
    const retryCountRef = useRef(0);

    const fetchTokens = useCallback(async () => {
        setIsLoading(true);
        const data = await getTokenDetailsApi();
        if (data) {
            setUsage(data.tokenUsed);
            setMaxTokens(data.totalToken || MAX_TOKENS);
            retryCountRef.current = 0;
        } else {
            if (retryCountRef.current < 3) {
                retryCountRef.current++;
                setTimeout(() => fetchTokens(), 1500);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchTokens();
    }, [fetchTokens]);

    const setTokenData = useCallback((data) => {
        if (data) {
            setUsage(data.tokenUsed);
            setMaxTokens(data.totalToken || MAX_TOKENS);
        }
    }, []);

    const incrementUsage = useCallback((amount = 1) => {
        setUsage(prev => Math.min(prev + amount, maxTokens));
    }, [maxTokens]);

    const refreshTokens = useCallback(() => {
        fetchTokens();
    }, [fetchTokens]);

    const remaining = Math.max(0, maxTokens - usage);

    const hasEnoughTokens = useCallback((eventName) => {
        const cost = getTokenCost(eventName);
        return remaining >= cost;
    }, [remaining]);

    const value = {
        usage,
        remaining,
        maxTokens,
        incrementUsage,
        refreshTokens,
        setTokenData,
        isLoading,
        hasTokens: remaining > 0,
        hasEnoughTokens,
    };

    return (
        <TokenUsageContext.Provider value={value}>
            {children}
        </TokenUsageContext.Provider>
    );
};

export const useTokenUsage = () => {
    const ctx = useContext(TokenUsageContext);
    if (!ctx) {
        throw new Error('useTokenUsage must be used within TokenUsageProvider');
    }
    return ctx;
};
