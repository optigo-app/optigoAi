'use client';
import React, { createContext, useContext, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    console.warn('useToast is being used outside of ToastProvider. Using fallback values.');
    return {
      showToast: () => {},
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
      removeToast: () => {},
      removeAllToasts: () => {},
    };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, options = {}) => {
    return toast(message, options);
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      ...options,
    });
  }, []);

  const showError = useCallback((message, options = {}) => {
    return toast.error(message, {
      duration: 6000,
      ...options,
    });
  }, []);

  const showWarning = useCallback((message, options = {}) => {
    return toast(message, {
      icon: '⚠️',
      duration: 4000,
      ...options,
    });
  }, []);

  const showInfo = useCallback((message, options = {}) => {
    return toast(message, {
      icon: 'ℹ️',
      duration: 4000,
      ...options,
    });
  }, []);

  const removeToast = useCallback((id) => {
    toast.dismiss(id);
  }, []);

  const removeAllToasts = useCallback(() => {
    toast.dismiss();
  }, []);

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    removeAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* React Hot Toast with default styling */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 6000,
          },
        }}
      />
    </ToastContext.Provider>
  );
};
