import React, { useEffect } from 'react'
import useRefreshToken from './useRefreshToken'
import { privateApi } from '../api/api';
import { useAuth } from '../context/AuthContext';


function useApi() {
  const { accessToken } = useAuth();
  const refresh = useRefreshToken();

  useEffect(() => {
    const requestIntercept = privateApi.interceptors.request.use(
      async config => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    const responseIntercept = privateApi.interceptors.response.use(
      res => res,
      async error => {
        const prevReq = error?.config;
        if (error?.response?.status === 401 && !prevReq?.sent) {
          prevReq.sent = true;
          const newAccessToken = await refresh();
          prevReq.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return privateApi(prevReq);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      privateApi.interceptors.response.eject(responseIntercept);
      privateApi.interceptors.request.eject(requestIntercept);
    };
  }, [accessToken, refresh]);

  return privateApi;
}

export default useApi