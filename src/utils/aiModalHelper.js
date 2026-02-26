/**
 * AI Modal Helper Utility
 * Determines which AI modal should be displayed based on environment variables
 */

/**
 * Get the appropriate AI modal type to display
 * @returns {string|null} - 'subscription', 'training', 'maintenance', or null
 */
export const getAiModalType = () => {
    const aiEnable = process.env.NEXT_PUBLIC_AI_ENABLE === '1';
    const aiReady = process.env.NEXT_PUBLIC_AI_READY === '1';
    const aiMaintenance = process.env.NEXT_PUBLIC_AI_MAINTENANCE_MODE === 'true';

    // Priority order:
    // 1. Maintenance mode (highest priority)
    // 2. No subscription
    // 3. Training in progress
    // 4. All good (null)

    if (aiMaintenance) {
        return 'maintenance';
    }

    if (!aiEnable) {
        return 'subscription';
    }

    if (!aiReady) {
        return 'training';
    }

    return null; // AI is ready to use
};

/**
 * Check if AI features should be blocked
 * @returns {boolean}
 */
export const shouldBlockAiFeatures = () => {
    return getAiModalType() !== null;
};

/**
 * Get modal configuration based on type
 * @param {string} type - Modal type ('subscription', 'training', 'maintenance')
 * @returns {object} - Modal configuration
 */
export const getModalConfig = (type) => {
    const configs = {
        subscription: {
            title: 'Unlock AI Magic',
            description: 'AI features require an active subscription',
            canClose: true,
        },
        training: {
            title: 'Fine-Tuning Your Experience',
            description: 'AI is currently being trained on your data',
            canClose: true,
        },
        maintenance: {
            title: 'AI Maintenance',
            description: 'AI features are temporarily unavailable',
            canClose: true,
        },
    };

    return configs[type] || null;
};
