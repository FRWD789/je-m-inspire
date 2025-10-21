// fontendTsx/src/hooks/usePrivateApi.ts
import { useEffect, useRef } from 'react';
import { privateApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Instance pour refresh sans intercepteurs
const apiSimple = axios.create({
    baseURL: "",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

export default function usePrivateApi() {
    const { accessToken, setAccessToken, setUser } = useAuth();
    const isRefreshingRef = useRef(false);
    const failedQueueRef = useRef<Array<{
        resolve: (token: string) => void;
        reject: (error: any) => void;
    }>>([]);

    useEffect(() => {
        // ✅ Intercepteur REQUEST : Ajouter le token
        const requestIntercept = privateApi.interceptors.request.use(
            async (config) => {
                console.log('🔑 Interceptor request - Token:', accessToken ? 'Présent' : 'Absent');
                
                if (accessToken && !config.headers["Authorization"]) {
                    config.headers["Authorization"] = `Bearer ${accessToken}`;
                    console.log('✅ Token ajouté aux headers');
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // ✅ Intercepteur RESPONSE : Gérer les 401 et refresh
        const responseIntercept = privateApi.interceptors.response.use(
            (res) => res,
            async (error) => {
                const originalRequest = error?.config;

                console.log('❌ Erreur détectée:', error.response?.status);

                // Si ce n'est pas une erreur 401, ou si on a déjà retry, rejeter
                if (error?.response?.status !== 401 || originalRequest?.sent) {
                    return Promise.reject(error);
                }

                // Si un refresh est déjà en cours, mettre en queue
                if (isRefreshingRef.current) {
                    console.log('⏳ Refresh en cours, mise en queue');
                    return new Promise((resolve, reject) => {
                        failedQueueRef.current.push({ resolve, reject });
                    })
                        .then((token) => {
                            originalRequest.headers["Authorization"] = `Bearer ${token}`;
                            return privateApi(originalRequest);
                        })
                        .catch((err) => {
                            return Promise.reject(err);
                        });
                }

                // Marquer qu'on a déjà tenté
                originalRequest.sent = true;
                isRefreshingRef.current = true;

                try {
                    console.log('🔄 401 détecté, tentative de refresh...');
                    
                    const response = await apiSimple.post('/api/refresh');
                    const newAccessToken = response.data.access_token;

                    if (!newAccessToken) {
                        throw new Error('Access token manquant');
                    }

                    console.log('✅ Nouveau token reçu');
                    setAccessToken(newAccessToken);

                    // Résoudre toutes les requêtes en queue
                    failedQueueRef.current.forEach((callback) => {
                        callback.resolve(newAccessToken);
                    });
                    failedQueueRef.current = [];

                    // Retry la requête originale
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    return privateApi(originalRequest);

                } catch (refreshError) {
                    console.error('❌ Erreur refresh:', refreshError);

                    // Rejeter toutes les requêtes en queue
                    failedQueueRef.current.forEach((callback) => {
                        callback.reject(refreshError);
                    });
                    failedQueueRef.current = [];

                    // Déconnecter l'utilisateur
                    setAccessToken(undefined);
                    setUser(undefined);

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshingRef.current = false;
                }
            }
        );

        return () => {
            privateApi.interceptors.request.eject(requestIntercept);
            privateApi.interceptors.response.eject(responseIntercept);
        };
    }, [accessToken, setAccessToken, setUser]);

    return privateApi;
}