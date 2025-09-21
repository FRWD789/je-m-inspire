// hooks/useRoles.js
import { useState, useEffect } from 'react';
import { apiSimple } from '../api';

export const useRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const response = await apiSimple.get('/api/roles');
                console.log('Réponse API roles complète:', response);
                
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
                } else {
                    console.error('Les données ne sont pas un tableau:', rolesData);
                    throw new Error('Format de réponse invalide');
                }
                
            } catch (err) {
                console.error('Erreur lors du chargement des rôles:', err);
                setError('Impossible de charger les rôles');
                // Fallback avec rôles par défaut
                setRoles([
                    { id: 1, role: 'user', description: 'Utilisateur' },
                    { id: 2, role: 'professional', description: 'Professionnel' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    return { roles, loading, error };
};