import {
    API_BASE_URL,
    API_ENDPOINTS,
    API_ERROR_MESSAGES,
    PROCESSOR_ENDPOINTS
} from '../utils/apiConfig';
import { apiCallBinary } from './apiService';

export const processingService = {
    async processImage(processorId, file, options = {}) {
        if (!file) {
            throw new Error(API_ERROR_MESSAGES.INVALID_FILE);
        }

        // Check if it's an AI generator (v2) or regular processor
        const isAIGenerator = processorId.includes('-v2');

        let endpoint;
        if (isAIGenerator) {
            // Use AI generation endpoints for v2 processors
            endpoint = API_ENDPOINTS.imageDynamicPrompts[processorId];
            if (!endpoint) {
                throw new Error(`Unknown AI generator: ${processorId}`);
            }
        } else {
            // Use regular processing endpoints
            endpoint = PROCESSOR_ENDPOINTS[processorId];
            if (!endpoint) {
                throw new Error(`Unknown processor: ${processorId}`);
            }
        }

        const formData = new FormData();
        formData.append('file', file);

        // Add prompt for AI generators (v2 processors)
        if (isAIGenerator && options.prompt) {
            formData.append('prompt', options.prompt);
        }

        const result = await apiCallBinary(endpoint, {
            method: 'POST',
            body: formData,
        });

        if (result && !(result instanceof Blob) && result.image_url) {
            const imageUrl = result.image_url.startsWith('http')
                ? result.image_url
                : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${result.image_url.replace(/\\/g, '/')}`;

            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch processed image from ${imageUrl}`);
            }
            return await imageResponse.blob();
        }
        return result;
    },

    async processImageMultiple(processorIds, file) {
        if (!file) {
            throw new Error(API_ERROR_MESSAGES.INVALID_FILE);
        }

        const promises = processorIds.map(processorId =>
            this.processImage(processorId, file)
                .catch(error => ({
                    processor: processorId,
                    error: error.message,
                    success: false,
                }))
        );

        return Promise.all(promises);
    },

    getAvailableProcessors() {
        return Object.keys(PROCESSOR_ENDPOINTS);
    },

    supportsPrompts(processorId) {
        return processorId.includes('-v2');
    },

    getAIGenerators() {
        return Object.keys(PROCESSOR_ENDPOINTS).filter(id => id.includes('-v2'));
    },

    async processImageBatch(processorIds, file, options = {}) {
        if (!file) {
            throw new Error(API_ERROR_MESSAGES.INVALID_FILE);
        }

        if (!processorIds || processorIds.length === 0) {
            throw new Error('At least one processor must be selected');
        }

        const promises = processorIds.map(async (processorId) => {
            try {
                const result = await this.processImage(processorId, file, options);
                return {
                    processorId,
                    status: 'success',
                    result,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.error(`❌ ${processorId} processing failed:`, error);
                return {
                    processorId,
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        });

        const results = await Promise.allSettled(promises);

        const successfulResults = results
            .filter(result => result.status === 'fulfilled' && result.value.status === 'success')
            .map(result => result.value);

        const failedResults = results
            .filter(result => result.status === 'rejected' || result.value.status === 'error')
            .map(result => result.status === 'rejected' ? result.reason : result.value);

        return {
            successful: successfulResults,
            failed: failedResults,
            total: processorIds.length
        };
    },
};
