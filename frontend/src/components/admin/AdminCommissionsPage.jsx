import React, { useState, useEffect } from 'react';
import { useAuth, useApi } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminCommissionsPage = () => {
    const { user, hasRole } = useAuth();
    const { get, put } = useApi();
    const navigate = useNavigate();
    
    const [professionals, setProfessionals] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Vérifier que l'utilisateur est admin
    useEffect(() => {
        if (!loading && !hasRole('admin')) {
            navigate('/');
        }
    }, [user, loading, hasRole, navigate]);

    // Charger les données
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [proResponse, statsResponse] = await Promise.all([
                get('/api/admin/commissions'),
                get('/api/admin/commissions/statistics')
            ]);

            if (proResponse.data.success) {
                setProfessionals(proResponse.data.data);
            }
            
            if (statsResponse.data.success) {
                setStatistics(statsResponse.data.data);
            }
        } catch (error) {
            console.error('Erreur chargement données:', error);
            alert('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (professional) => {
        setEditingId(professional.id);
        setEditValue(professional.commission_rate.toString());
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    const handleSave = async (professionalId) => {
        const rate = parseFloat(editValue);
        
        if (isNaN(rate) || rate < 0 || rate > 100) {
            alert('Le taux doit être entre 0 et 100');
            return;
        }

        try {
            setSaving(true);
            const response = await put(`/api/admin/commissions/${professionalId}`, {
                commission_rate: rate
            });

            if (response.data.success) {
                // Mettre à jour l'état local
                setProfessionals(prev => 
                    prev.map(p => 
                        p.id === professionalId 
                            ? { ...p, commission_rate: rate }
                            : p
                    )
                );
                setEditingId(null);
                setEditValue('');
                
                // Rafraîchir les statistiques
                const statsResponse = await get('/api/admin/commissions/statistics');
                if (statsResponse.data.success) {
                    setStatistics(statsResponse.data.data);
                }
            }
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const filteredProfessionals = professionals.filter(pro => 
        pro.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pro.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '24px' }}>⏳ Chargement...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1 style={{ margin: 0 }}>Gestion des Commissions</h1>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    ← Retour
                </button>
            </div>

            {/* Statistiques */}
            {statistics && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    <div style={statCardStyle}>
                        <div style={statLabelStyle}>Total Professionnels</div>
                        <div style={statValueStyle}>{statistics.total_professionals}</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={statLabelStyle}>Taux Moyen</div>
                        <div style={statValueStyle}>{statistics.average_rate}%</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={statLabelStyle}>Taux Min/Max</div>
                        <div style={statValueStyle}>
                            {statistics.min_rate}% - {statistics.max_rate}%
                        </div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={statLabelStyle}>Avec Stripe</div>
                        <div style={statValueStyle}>{statistics.with_stripe}</div>
                    </div>
                    <div style={statCardStyle}>
                        <div style={statLabelStyle}>Avec PayPal</div>
                        <div style={statValueStyle}>{statistics.with_paypal}</div>
                    </div>
                </div>
            )}

            {/* Barre de recherche */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="🔍 Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '16px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            {/* Tableau des professionnels */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={thStyle}>Professionnel</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Paiements</th>
                            <th style={thStyle}>Taux Commission</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProfessionals.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    Aucun professionnel trouvé
                                </td>
                            </tr>
                        ) : (
                            filteredProfessionals.map((pro) => (
                                <tr key={pro.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 'bold' }}>{pro.full_name}</div>
                                    </td>
                                    <td style={tdStyle}>{pro.email}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {pro.has_stripe && (
                                                <span style={badgeStyle('#635bff')}>Stripe</span>
                                            )}
                                            {pro.has_paypal && (
                                                <span style={badgeStyle('#0070ba')}>PayPal</span>
                                            )}
                                            {!pro.has_stripe && !pro.has_paypal && (
                                                <span style={badgeStyle('#6c757d')}>Aucun</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        {editingId === pro.id ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <input
                                                    type="number"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    disabled={saving}
                                                    style={{
                                                        width: '80px',
                                                        padding: '6px',
                                                        border: '2px solid #007bff',
                                                        borderRadius: '4px',
                                                        fontSize: '14px'
                                                    }}
                                                    autoFocus
                                                />
                                                <span>%</span>
                                            </div>
                                        ) : (
                                            <span style={{ 
                                                fontSize: '18px', 
                                                fontWeight: 'bold',
                                                color: pro.commission_rate > 0 ? '#28a745' : '#6c757d'
                                            }}>
                                                {pro.commission_rate}%
                                            </span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        {editingId === pro.id ? (
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button
                                                    onClick={() => handleSave(pro.id)}
                                                    disabled={saving}
                                                    style={{
                                                        ...actionButtonStyle,
                                                        backgroundColor: '#28a745'
                                                    }}
                                                >
                                                    {saving ? '⏳' : '✓'}
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    disabled={saving}
                                                    style={{
                                                        ...actionButtonStyle,
                                                        backgroundColor: '#dc3545'
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(pro)}
                                                style={{
                                                    ...actionButtonStyle,
                                                    backgroundColor: '#007bff'
                                                }}
                                            >
                                                ✏️ Modifier
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer info */}
            <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#e9ecef',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#6c757d'
            }}>
                💡 <strong>Info :</strong> Le taux de commission est appliqué sur chaque vente 
                d'événement créé par le professionnel. Il doit être compris entre 0% et 100%.
            </div>
        </div>
    );
};

// Styles
const statCardStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
};

const statLabelStyle = {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '8px'
};

const statValueStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333'
};

const thStyle = {
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333',
    borderBottom: '2px solid #dee2e6'
};

const tdStyle = {
    padding: '15px'
};

const badgeStyle = (bgColor) => ({
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: bgColor,
    color: 'white',
    fontSize: '12px',
    borderRadius: '4px',
    fontWeight: 'bold'
});

const actionButtonStyle = {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
};

export default AdminCommissionsPage;