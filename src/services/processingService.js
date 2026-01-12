import {
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
            console.log(`🎨 Generating jewelry with ${processorId} using prompt: "${options.prompt.substring(0, 50)}..."`);
        } else {
            console.log(`🔄 Processing image with ${processorId} at ${endpoint}`);
        }

        // apiCallBinary expects endpoint, not full URL if it appends base URL itself.
        // However, our apiCallBinary implementation PREPENDS API_BASE_URL.
        // So we just pass the endpoint path.
        const result = await apiCallBinary(endpoint, {
            method: 'POST',
            body: formData,
        });

        console.log(`✅ ${processorId} processing result:`, result);
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

        console.log(`🎨 Starting batch processing with ${processorIds.length} processors`);
        if (options.prompt) {
            console.log(`📝 Using prompt: "${options.prompt.substring(0, 100)}${options.prompt.length > 100 ? '...' : ''}"`);
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

        console.log(`✅ Batch processing completed: ${successfulResults.length} successful, ${failedResults.length} failed`);

        return {
            successful: successfulResults,
            failed: failedResults,
            total: processorIds.length
        };
    },
};
