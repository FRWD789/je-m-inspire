import { useEffect, useRef } from 'react'
import { privateApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import useRefresh from './useRefresh';

export default function usePrivateApi() {
    const { accessToken, setAccessToken } = useAuth()
    const refresh = useRefresh()
    
    // Use ref to always have the latest accessToken
    const accessTokenRef = useRef(accessToken);
    
    // Keep the ref updated on every token change
    useEffect(() => {
        accessTokenRef.current = accessToken;
        console.log('🔄 Token ref updated:', accessToken ? 'Present' : 'Missing');
    }, [accessToken]);

    useEffect(() => {
        console.log('🛠️ Setting up interceptors');

        // Request interceptor - Add token to outgoing requests
        const requestInterceptor = privateApi.interceptors.request.use(
            (config) => {
                // ALWAYS use the ref to get the latest token
                const currentToken = accessTokenRef.current;
                console.log('🔑 Interceptor - Current token:', currentToken ? 'Present' : 'Missing');
                console.log('🔑 Interceptor - Request to:', config.url);
                
                if (currentToken) {
                    config.headers.Authorization = `Bearer ${currentToken}`;
                    console.log('✅ Token added to request:', config.url);
                } else {
                    console.warn('⚠️ No token available for request:', config.url);
                }
                
                return config;
            },
            (error) => {
                console.error('❌ Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor - Handle 401 errors
        const responseInterceptor = privateApi.interceptors.response.use(
            (response) => {
                console.log('✅ Response received:', response.status, response.config.url);
                return response;
            },
            async (error) => {
                const originalRequest = error?.config;
                console.log('❌ Response error:', error.response?.status, error.config?.url);
                
                // If 401 error and not already retried
                if (error?.response?.status === 401 && !originalRequest?._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        console.log('🔄 401 detected, attempting token refresh...');
                        const { new_access_token } = await refresh();
                        
                        // Update the access token in context AND ref
                        setAccessToken(new_access_token);
                        accessTokenRef.current = new_access_token;
                        
                        console.log('✅ Token refreshed, retrying request...');
                        
                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${new_access_token}`;
                        return privateApi(originalRequest);
                        
                    } catch (refreshError) {
                        console.error('❌ Refresh failed:', refreshError);
                        // Clear auth state on refresh failure
                        setAccessToken(undefined);
                        accessTokenRef.current = undefined;
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        // Cleanup interceptors
        return () => {
            console.log('🧹 Cleaning up interceptors');
            privateApi.interceptors.request.eject(requestInterceptor);
            privateApi.interceptors.response.eject(responseInterceptor);
        };
    }, [accessToken, refresh, setAccessToken]) // Keep dependencies to re-setup when token changes

    return privateApi;
}