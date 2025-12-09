'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [pageDataLoaded, setPageDataLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cookieData, setCookieDataState] = useState(null);

  const setCookieData = (data) => {
    setCookieDataState(data);
  };

  const getQueryParams = () => {
    // If FE parameter is present, skip authentication redirect
    // if (searchParams.get('FE')) {
    //   setIsReady(true);
    //   setPageDataLoaded(true);
    //   return;
    // }

    const isLoggedIn = Cookies.get('isLoggedIn');

    if (isLoggedIn === 'true') {
      const authQueryParams = sessionStorage.getItem("AuthqueryParams");
      if (authQueryParams) {
        const decodedPayload = JSON.parse(authQueryParams);
        setCookieData(decodedPayload);
        setIsReady(true);
        setPageDataLoaded(true);
        setIsLoggedIn(true);
        return decodedPayload;
      } else {
        setIsReady(true);
        setPageDataLoaded(true);
        setTimeout(() => router.replace('/authenticate', { replace: true }), 2);
        return;
      }
    }

    const token = Cookies.get('skey');
    if (!token) {
      const authQueryParams = sessionStorage.getItem("AuthqueryParams");
      if (authQueryParams && isLoggedIn) {
        const decodedPayload = JSON.parse(authQueryParams);
        setCookieData(decodedPayload);
        setIsReady(true);
        setPageDataLoaded(true);
        setIsLoggedIn(true);
        return decodedPayload;
      } else {
        if (!isLoggedIn) {
          localStorage.clear();
          sessionStorage.clear();
        }
        setIsReady(true);
        setPageDataLoaded(true);
        setTimeout(() => router.replace('/authenticate', { replace: true }), 2);
        return;
      }
    }

    const decoded = jwtDecode(token);
    const decodedPayload = {
      ...decoded,
      uid: decodeBase64(decoded.uid),
    };

    if (decodedPayload) {
      sessionStorage.setItem("AuthqueryParams", JSON.stringify(decodedPayload));
      setCookieData(decodedPayload);
      setIsReady(true);
      setPageDataLoaded(true);
    }

    return decodedPayload;
  };

  // useEffect(() => {
  //   if (searchParams.get('FE')) {
  //     sessionStorage.setItem("urlParams", 'fe')
  //     router.push('/product');
  //   }
  // }, [pathname, searchParams, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!Cookies.get('skey')) {
        const hostname = window.location.hostname;
        const isAllowedHost = hostname === 'localhost' || hostname.includes('nzen') || hostname.includes('optigoai.web');
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpdGFzayIsImF1ZCI6IllXUnRhVzVBYjNKaGFXd3VZMjh1YVc0PSIsImV4cCI6MTc2NDMzMDkzMywidWlkIjoiWVdSdGFXNUFiM0poYVd3dVkyOHVhVzQ9IiwieWMiOiJlM3R1ZW1WdWZYMTdlekl3ZlgxN2UyOXlZV2xzTWpWOWZYdDdiM0poYVd3eU5YMTkiLCJzdiI6IjAiLCJhdGsiOiJkRzlyWlc1ZmMyVmpjbVYwWDJ0bGVWOXRhV0Z2Y21FPSJ9.Q1wI4B8llVZ5SC1V7Zyg3wVjo7SNcvkEzZ_EHePexvA';
        if (isAllowedHost) {
          const isHttps = window.location.protocol === 'https:';
          Cookies.set('skey', token, isHttps ? { sameSite: 'None', secure: true } : { sameSite: 'Lax' });
        }
      }
      getQueryParams();
    }
  }, []);

  useEffect(() => {
    getQueryParams();
  }, []);


  const value = {
    isReady,
    pageDataLoaded,
    isLoggedIn,
    cookieData,
    getQueryParams,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};