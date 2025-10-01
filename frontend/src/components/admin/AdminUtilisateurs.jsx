import React, { useState, useEffect } from 'react';
import { useApi } from "../../contexts/AuthContext";

export const AdminUtilisateurs = () => {
    const { get } = useApi();
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUtilisateurs();
    }, []);

    const fetchUtilisateurs = async () => {
        setLoading(true);
        try {
            const response = await get('/api/utilisateurs');
            const data = response.data || response;
            setUtilisateurs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les utilisateurs');
            setUtilisateurs([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Chargement...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
    }

    return (
        <div>
            <h2 style={{ color: '#50562E', marginBottom: '20px' }}>
                Gestion des utilisateurs ({utilisateurs.length})
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#50562E', color: '#FAF5EE' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Nom</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Ville</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Date inscription</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Réservations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {utilisateurs.map((user, index) => (
                            <tr key={user.id} style={{
                                borderBottom: '1px solid #eee',
                                backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                            }}>
                                <td style={{ padding: '12px' }}>
                                    {user.name} {user.last_name}
                                </td>
                                <td style={{ padding: '12px' }}>{user.email}</td>
                                <td style={{ padding: '12px' }}>{user.city || 'N/A'}</td>
                                <td style={{ padding: '12px' }}>
                                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#e3f2fd',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}>
                                        {user.reservations_count || 0}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};