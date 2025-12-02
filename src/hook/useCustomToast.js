'use client';

import { useToast } from "@/context/ToastContext";

// Enhanced hook with additional convenience methods
export const useCustomToast = () => {
  const toast = useToast();

  // Enhanced methods with common use cases
  const showApiError = (error) => {
    const message = error?.message || error?.error || 'An unexpected error occurred';
    return toast.showError(message, { duration: 6000 });
  };

  const showApiSuccess = (message, count = null) => {
    const finalMessage = count !== null ? `${message} (${count} items)` : message;
    return toast.showSuccess(finalMessage, { duration: 3000 });
  };

  const showValidationError = (message) => {
    return toast.showWarning(message, { duration: 4000 });
  };

  const showLoadingInfo = (message) => {
    return toast.showInfo(message, { duration: 2000 });
  };

  const showFileUploadSuccess = (fileName) => {
    return toast.showSuccess(`File "${fileName}" uploaded successfully!`, { duration: 3000 });
  };

  const showFileUploadError = (fileName, reason = 'Invalid file format') => {
    return toast.showError(`Failed to upload "${fileName}": ${reason}`, { duration: 5000 });
  };

  const showSearchResults = (count) => {
    if (count > 0) {
      return toast.showSuccess(`Found ${count} matching results!`, { duration: 3000 });
    } else {
      return toast.showInfo('No results found. Try adjusting your search criteria.', { duration: 4000 });
    }
  };

  const showProcessingComplete = (processorName) => {
    return toast.showSuccess(`${processorName} processing completed!`, { duration: 3000 });
  };

  const showProcessingError = (processorName, error) => {
    const message = `${processorName} processing failed: ${error?.message || 'Unknown error'}`;
    return toast.showError(message, { duration: 6000 });
  };

  return {
    // Original methods
    ...toast,
    
    // Enhanced convenience methods
    showApiError,
    showApiSuccess,
    showValidationError,
    showLoadingInfo,
    showFileUploadSuccess,
    showFileUploadError,
    showSearchResults,
    showProcessingComplete,
    showProcessingError,
  };
};

export default useCustomToast;
