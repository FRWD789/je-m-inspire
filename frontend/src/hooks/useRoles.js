// frontend/src/hooks/useRoles.js
import { useState, useEffect } from 'react';
import { useApi } from '../contexts/AuthContext';

export const useRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { apiSimple } = useApi();

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                console.log('🔄 Chargement des rôles...');
                
                const response = await apiSimple.get('/api/roles');
                console.log('✅ Rôles reçus:', response.data);
                
                let rolesData = response.data;
                
                // Si c'est une string avec du texte avant le JSON, extraire le JSON
                if (typeof rolesData === 'string') {
                    try {
                        const jsonStart = rolesData.indexOf('[');
                        if (jsonStart !== -1) {
                            const jsonPart = rolesData.substring(jsonStart);
                            rolesData = JSON.parse(jsonPart);
                        } else {
                            throw new Error('Pas de JSON trouvé dans la réponse');
                        }
                    } catch (parseError) {
                        console.error('Erreur de parsing JSON:', parseError);
                        throw new Error('Format JSON invalide');
                    }
                }
                
                if (Array.isArray(rolesData)) {
                    setRoles(rolesData);
                    setError(null);
                    console.log('✅ Rôles chargés:', rolesData.length, 'rôles');
                } else {
                    console.error('Les données ne sont pas un tableau:', rolesData);
                    throw new Error('Format de réponse invalide');
                }
                
            } catch (err) {
                console.error('❌ Erreur lors du chargement des rôles:', err);
                setError('Impossible de charger les rôles');
                
                // Fallback avec rôles par défaut
                const defaultRoles = [
                    { id: 1, role: 'utilisateur', description: 'Utilisateur' },
                    { id: 2, role: 'professionnel', description: 'Professionnel' }
                ];
                setRoles(defaultRoles);
                console.log('⚠️ Utilisation des rôles par défaut:', defaultRoles);
                
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, [apiSimple]);

    return { roles, loading, error };
};