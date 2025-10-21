// fontendTsx/src/components/persistLogin.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Outlet } from 'react-router-dom';
import axios from 'axios';

// Instance simple pour le refresh
const apiSimple = axios.create({
    baseURL: "",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

export default function PersistLogin() {
    const { accessToken, setAccessToken, setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyRefreshToken = async () => {
            console.log('🔄 PersistLogin: Tentative de refresh du token...');
            
            try {
                const response = await apiSimple.post('/api/refresh');
                
                if (response.data.access_token) {
                    console.log('✅ Token refreshed avec succès');
                    setAccessToken(response.data.access_token);
                    
                    // Charger les infos utilisateur
                    const userResponse = await apiSimple.get('/api/me', {
                        headers: {
                            Authorization: `Bearer ${response.data.access_token}`
                        }
                    });
                    
                    setUser(userResponse.data);
                    console.log('✅ Utilisateur chargé');
                }
            } catch (error) {
                console.log('⚠️ Pas de session valide');
                setAccessToken(undefined);
                setUser(undefined);
            } finally {
                setIsLoading(false);
            }
        };

        // ✅ TOUJOURS tenter un refresh au chargement (même si accessToken existe)
        // Car au refresh de page, le token en mémoire est perdu
        console.log('🔄 PersistLogin: Initialisation...');
        verifyRefreshToken();
    }, []); // ⚠️ Tableau vide pour n'exécuter qu'une fois au montage

    return <Outlet />; // ✅ Toujours render l'Outlet, le loader est dans App.tsx
}