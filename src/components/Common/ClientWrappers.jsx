"use client";
import React, { useEffect } from 'react';
import { setupGlobalErrorHandlers } from '@/utils/errorLogger';
import ErrorBoundary from './ErrorBoundary';

export default function ClientWrappers({ children }) {
    useEffect(() => {
        setupGlobalErrorHandlers();
    }, []);

    return (
        <ErrorBoundary>
            {children}
        </ErrorBoundary>
    );
}
