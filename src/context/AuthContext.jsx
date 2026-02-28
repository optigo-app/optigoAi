'use client';

import React, { createContext, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { getConfigFlagApi } from '@/app/api/getConfigApi';
import { setEncryptedSession, getEncryptedSession } from '@/utils/encryption';

const decodeBase64 = (str) => {
  try {
    return atob(str);
  } catch (e) {
    return str;
  }
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthReady, setIsAuthReady] = React.useState(false);
  const [configFlags, setConfigFlags] = React.useState(null);

  const getQueryParams = () => {
    const token = Cookies.get('skey');
    if (!token) {
      const authQueryParams = sessionStorage.getItem("AuthqueryParams");
      if (authQueryParams) {
        const decodedPayload = JSON.parse(authQueryParams);
        return decodedPayload;
      }
      return null;
    }

    const decoded = jwtDecode(token);
    const decodedPayload = {
      ...decoded,
      uid: decodeBase64(decoded.uid)
    };

    if (decodedPayload) {
      sessionStorage.setItem("AuthqueryParams", JSON.stringify(decodedPayload));
    }

    return decodedPayload;
  };

  // Helper function to check config flags
  const getConfigFlag = (flagName) => {
    if (!configFlags) {
      // Try to get from sessionStorage if not in state
      const cachedFlags = getEncryptedSession('configFlags');
      return cachedFlags?.[flagName] || '0';
    }
    return configFlags[flagName] || '0';
  };

  // Helper function to check if flag is enabled (value is '1')
  const isConfigEnabled = (flagName) => {
    return getConfigFlag(flagName) === '1';
  };

  useEffect(() => {
    if (searchParams.get('FE')) {
      sessionStorage.setItem("urlParams", 'fe')
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const initAuth = () => {
      if (pathname === '/error_404') {
        setIsAuthReady(true);
        return;
      }
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isAllowedHost = hostname === 'localhost' || hostname.includes('nzen') || hostname.includes('optigoai.web');
        const isIframe = window.self !== window.top;
        const token = Cookies.get('skey');

        // Security check: If NOT an allowed host, must be in an iframe AND have a session cookie
        if (!isAllowedHost && (!isIframe || !token)) {
          router.replace('/error_404');
          return;
        }

        if (!token) {
          if (isAllowedHost) {
            const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpdGFzayIsImF1ZCI6IllXUnRhVzVBYjNKaGFXd3VZMjh1YVc0PSIsImV4cCI6MTc2NTQ0MTczOCwidWlkIjoiWVdSdGFXNUFiM0poYVd3dVkyOHVhVzQ9IiwieWMiOiJlM3R1ZW1WdWZYMTdlekl3ZlgxN2UyOXlZV2xzTWpWOWZYdDdiM0poYVd3eU5YMTkiLCJzdiI6IjAiLCJhdGsiOiJkRzlyWlc1ZlkyeHBaVzUwTVY5elpXTnlaWFJmYTJWNVh6RXlNelExIiwiY3V2ZXIiOiJSNTBCMyJ9.Kfx8ylk2omd2zmjP7SwnhN_vjcesCG83jV7M8Nr3ufU';
            const isHttps = window.location.protocol === 'https:';
            Cookies.set('skey', mockToken, isHttps ? { sameSite: 'None', secure: true } : { sameSite: 'Lax' });
            const authQueryParams = sessionStorage.getItem("AuthqueryParams");
            if (!authQueryParams) {
              const decoded = jwtDecode(mockToken);
              const decodedPayload = {
                ...decoded,
                uid: decodeBase64(decoded.uid),
              };
              if (decodedPayload) {
                sessionStorage.setItem("AuthqueryParams", JSON.stringify(decodedPayload));
              }
            }
            // Re-check after setting cookie
            const params = getQueryParams();
            if (params) {
              setIsAuthReady(true);
            }
          } else {
            router.replace('/error_404');
          }
        } else {
          const params = getQueryParams();
          if (params) {
            setIsAuthReady(true);
          } else {
            router.replace('/error_404');
          }
        }
      }
    };

    initAuth();
  }, [pathname]);

  // Fetch config flags when auth is ready
  useEffect(() => {
    const fetchConfigFlags = async () => {
      if (!isAuthReady) return;

      try {
        // Always call API on reload to get fresh config flags
        console.log('📡 Fetching config flags from API...');
        const response = await getConfigFlagApi();
        
        if (response?.rd) {
          const flagsObject = response.rd.reduce((acc, item) => {
            acc[item.key] = item.Value;
            return acc;
          }, {});

          console.log('✅ Config flags fetched:', flagsObject);
          setConfigFlags(flagsObject);
          setEncryptedSession('configFlags', flagsObject);
        } else {
          console.warn('⚠️ API response does not have expected structure');
        }
      } catch (error) {
        console.error('❌ Error fetching config flags:', error);
      }
    };

    fetchConfigFlags();
  }, [isAuthReady]);

  // Prevent app rendering until auth check is finalized
  if (!isAuthReady && pathname !== '/error_404') {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        getQueryParams,
        isAuthReady,
        configFlags,
        getConfigFlag,
        isConfigEnabled
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};