'use client';
import React, { createContext, useContext, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    console.warn('useToast is being used outside of ToastProvider. Using fallback values.');
    return {
      showToast: () => { },
      showSuccess: () => { },
      showError: () => { },
      showWarning: () => { },
      showInfo: () => { },
      removeToast: () => { },
      removeAllToasts: () => { },
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
            borderRadius: '16px',
            background: '#ffffff',
            color: '#2c2c2c',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#7367f0',
              secondary: '#fff',
            },
          },
          error: {
            duration: 6000,
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
        }}
      />
    </ToastContext.Provider>
  );
};
