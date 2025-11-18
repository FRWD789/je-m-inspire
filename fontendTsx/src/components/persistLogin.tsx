import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Outlet } from 'react-router-dom'
import useRefresh from '../hooks/useRefresh'
import { authService } from '@/service/authService';

export default function PersistLogin() {
    const { accessToken, setAccessToken, setUser } = useAuth();    
    const [isLoading, setIsLoading] = useState(true)
        useEffect(() => {
              const verifyAuth = async () => {
                    try {
                    if (!accessToken) {
                        const { access_token, user } = await authService.refresh();
                        if (access_token && user) {
                        setAccessToken(access_token);
                        setUser(user);
                        } else {
                        // Refresh failed → redirect to login or just continue
                        console.log("❌ Refresh failed, user needs to login");
                        }
                    } else {
                        console.log("✅ User session is valid");
                    }
                    } catch (error) {
                    console.error("❌ Error verifying auth:", error);
                    // Optionally, redirect to login
                    // navigate("/login");
                    } finally {
                    setIsLoading(false); // ✅ ensure loading stops
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