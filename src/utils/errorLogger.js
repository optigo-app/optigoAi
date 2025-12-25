import { getAuthData } from './globalFunc';

/**
 * Logs an error to the server.
 * @param {Object} params
 * @param {string} params.shortReason - A brief description of the error.
 * @param {string|Object} params.detailedReason - Detailed information about the error.
 */
export const logErrorToServer = async ({ shortReason, detailedReason }) => {
    try {
        const authData = getAuthData();
        const userId = authData?.uid || authData?.username || 'Guest';
        const tokenNo = authData?.atk || 'Guest';

        const payload = {
            userId,
            tokenNo,
            timestamp: new Date().toISOString(),
            shortReason,
            detailedReason: typeof detailedReason === 'object' ? JSON.stringify(detailedReason, null, 2) : String(detailedReason),
        };

        // Fire and forget or handle response silently
        fetch('/api/logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).catch(err => console.error('Failed to send log to server:', err));

    } catch (e) {
        console.error('Error in logErrorToServer:', e);
    }
};

/**
 * Global error handler for window.onerror and onunhandledrejection
 */
export const setupGlobalErrorHandlers = () => {
    if (typeof window === 'undefined') return;

    window.onerror = (message, source, lineno, colno, error) => {
        logErrorToServer({
            shortReason: `Global Error: ${message}`,
            detailedReason: {
                source,
                lineno,
                colno,
                stack: error?.stack,
                userAgent: navigator.userAgent
            }
        });
        return false; // Don't prevent default browser error logging
    };

    window.onunhandledrejection = (event) => {
        logErrorToServer({
            shortReason: `Unhandled Promise Rejection: ${event.reason}`,
            detailedReason: {
                reason: event.reason,
                stack: event.reason?.stack,
                userAgent: navigator.userAgent
            }
        });
    };
};
