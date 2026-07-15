"use client";
import React, { useEffect } from 'react';
import { setupGlobalErrorHandlers } from '@/utils/errorLogger';
import { getClientIpAddress } from '@/utils/globalFunc';
import ErrorBoundary from './ErrorBoundary';

export default function ClientWrappers({ children }) {
    useEffect(() => {
        setupGlobalErrorHandlers();
        getClientIpAddress();
    }, []);

    return (
        <ErrorBoundary>
            {children}
        </ErrorBoundary>
    );
}
