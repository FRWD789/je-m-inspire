import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Outlet } from 'react-router-dom'
import useRefresh from '../hooks/useRefresh'
import { authService } from '@/features/auth/service/authService';

export default function PersistLogin() {
    const { accessToken, setAccessToken, setUser } = useAuth();    
    const [isLoading, setIsLoading] = useState(true)
        useEffect(() => {
              const verifyAuth = async () => {
                    try {
                    if (!accessToken) {
                        console.log('🔄 No access token, attempting refresh...');
                        const { access_token, user } = await authService.refresh();
                        if (access_token && user) {
                        setAccessToken(access_token);
                        setUser(user);
                        console.log("✅ Session restored successfully");
                        } else {
                        console.log("❌ Refresh failed, user needs to login");
                        }
                    } else {
                        console.log("✅ User session is valid");
                    }
                    } catch (error: any) {
                    // Only log if it's not a simple 401 (no refresh token)
                    if (error?.response?.status !== 401) {
                        console.error("❌ Error verifying auth:", error);
                    } else {
                        console.log("ℹ️ No refresh token available");
                    }
                    } finally {
                    setIsLoading(false);
                    }
                };
            verifyAuth();
        }, [])




    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Vérification de la session...</p>
                </div>
            </div>
        )
    }
    return <Outlet />
}