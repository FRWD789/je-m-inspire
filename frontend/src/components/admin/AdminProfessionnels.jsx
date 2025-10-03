import React, { useState, useEffect } from 'react';
import { useApi } from "../../contexts/AuthContext";

export const AdminProfessionnels = () => {
    const { get, put, delete: deleteApi } = useApi();
    const [professionnels, setProfessionnels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfessionnels();
    }, []);

    const fetchProfessionnels = async () => {
        setLoading(true);
        try {
            const response = await get('/api/professionnels');
            const data = response.data || response;
            setProfessionnels(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les professionnels');
            setProfessionnels([]);
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
                Gestion des professionnels ({professionnels.length})
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
                        </tr>
                    </thead>
                    <tbody>
                        {professionnels.map((pro, index) => (
                            <tr key={pro.id} style={{
                                borderBottom: '1px solid #eee',
                                backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                            }}>
                                <td style={{ padding: '12px' }}>
                                    {pro.name} {pro.last_name}
                                </td>
                                <td style={{ padding: '12px' }}>{pro.email}</td>
                                <td style={{ padding: '12px' }}>{pro.city || 'N/A'}</td>
                                <td style={{ padding: '12px' }}>
                                    {new Date(pro.created_at).toLocaleDateString('fr-FR')}
                                </td>
                                
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};