import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useApi } from '../../contexts/AuthContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, isProfessional, refreshUser } = useAuth();
    const { subscription, hasProPlus, hasActiveSubscription, loading: subLoading } = useSubscription();
    const { get, post, put } = useApi();
    
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        last_name: '',
        email: '',
        city: '',
        date_of_birth: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [linkingProvider, setLinkingProvider] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                city: user.city || '',
                date_of_birth: user.date_of_birth || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await put('/api/profile/update', formData);
            await refreshUser();
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
            setEditing(false);
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Erreur lors de la mise à jour' 
            });
        } finally {
            setSaving(false);
        }
    };

    const handleLinkAccount = async (provider) => {
        setLinkingProvider(provider);
        
        try {
            const endpoint = provider === 'stripe' 
                ? '/api/profile/stripe/link' 
                : '/api/profile/paypal/link';
            
            const response = await get(endpoint, {});
            
            if (response.data.success && response.data.url) {
                window.location.href = response.data.url;
            } else {
                alert('Erreur lors de la liaison du compte');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors de la liaison');
        } finally {
            setLinkingProvider(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Non spécifié';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    if (!user) {
        return <div>Chargement...</div>;
    }

    return (
        <div style={{
            maxWidth: '1000px',
            margin: '40px auto',
            padding: '0 20px'
        }}>
            {/* En-tête avec nom et boutons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div>
                    <h1 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>
                        {user.name} {user.last_name}
                    </h1>
                    <p style={{ margin: 0, color: '#666' }}>
                        {user.roles?.map(role => {
                            const roleNames = {
                                'admin': 'Administrateur',
                                'professionnel': 'Professionnel',
                                'utilisateur': 'Utilisateur'
                            };
                            return roleNames[role.role] || role.role;
                        }).join(', ')}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Bouton Pro Plus si professionnel sans abonnement */}
                    {isProfessional() && !hasProPlus && (
                        <button
                            onClick={() => navigate('/abonnement')}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                            }}
                        >
                            ⭐ S'abonner à Pro Plus
                        </button>
                    )}

                    {/* Boutons de liaison de compte si Pro Plus actif */}
                    {isProfessional() && hasProPlus && (
                        <>
                            <button
                                onClick={() => handleLinkAccount('stripe')}
                                disabled={linkingProvider !== null}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: linkingProvider === 'stripe' ? '#6c757d' : '#635bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: linkingProvider ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {linkingProvider === 'stripe' ? '⏳' : '💳'} 
                                Lier Stripe
                            </button>

                            <button
                                onClick={() => handleLinkAccount('paypal')}
                                disabled={linkingProvider !== null}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: linkingProvider === 'paypal' ? '#6c757d' : '#0070ba',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: linkingProvider ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {linkingProvider === 'paypal' ? '⏳' : '🅿️'} 
                                Lier PayPal
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Message de feedback */}
            {message.text && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                    borderRadius: '8px',
                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Statut d'abonnement Pro Plus */}
            {isProfessional() && hasProPlus && (
                <div style={{
                    padding: '20px',
                    marginBottom: '30px',
                    backgroundColor: '#d4edda',
                    borderRadius: '10px',
                    border: '1px solid #c3e6cb'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>
                        ✅ Abonnement Pro Plus Actif
                    </h3>
                    {subscription?.subscription && (
                        <div style={{ color: '#155724' }}>
                            <p style={{ margin: '5px 0' }}>
                                <strong>Début :</strong> {formatDate(subscription.subscription.start_date)}
                            </p>
                            {subscription.subscription.end_date && (
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Fin :</strong> {formatDate(subscription.subscription.end_date)}
                                </p>
                            )}
                            {subscription.subscription.expiring_soon && (
                                <p style={{ 
                                    margin: '10px 0 0 0', 
                                    padding: '10px', 
                                    backgroundColor: '#fff3cd',
                                    color: '#856404',
                                    borderRadius: '5px'
                                }}>
                                    ⚠️ Votre abonnement expire bientôt
                                </p>
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => navigate('/abonnement')}
                        style={{
                            marginTop: '15px',
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Gérer mon abonnement
                    </button>
                </div>
            )}

            {/* Informations personnelles */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px'
                }}>
                    <h2 style={{ margin: 0 }}>Informations personnelles</h2>
                    <button
                        onClick={() => editing ? handleSave() : setEditing(true)}
                        disabled={saving}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: editing ? '#28a745' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Modifier'}
                    </button>
                </div>

                {editing && (
                    <button
                        onClick={() => {
                            setEditing(false);
                            setFormData({
                                name: user.name || '',
                                last_name: user.last_name || '',
                                email: user.email || '',
                                city: user.city || '',
                                date_of_birth: user.date_of_birth || ''
                            });
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginBottom: '15px'
                        }}
                    >
                        Annuler
                    </button>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                            Prénom
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px'
                                }}
                            />
                        ) : (
                            <p style={{ margin: 0, padding: '10px 0', color: '#666' }}>
                                {user.name || 'Non spécifié'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                            Nom de famille
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px'
                                }}
                            />
                        ) : (
                            <p style={{ margin: 0, padding: '10px 0', color: '#666' }}>
                                {user.last_name || 'Non spécifié'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                            Email
                        </label>
                        {editing ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px'
                                }}
                            />
                        ) : (
                            <p style={{ margin: 0, padding: '10px 0', color: '#666' }}>
                                {user.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                            Ville
                        </label>
                        {editing ? (
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px'
                                }}
                            />
                        ) : (
                            <p style={{ margin: 0, padding: '10px 0', color: '#666' }}>
                                {user.city || 'Non spécifié'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                            Date de naissance
                        </label>
                        {editing ? (
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px'
                                }}
                            />
                        ) : (
                            <p style={{ margin: 0, padding: '10px 0', color: '#666' }}>
                                {formatDate(user.date_of_birth)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                            Membre depuis
                        </label>
                        <p style={{ margin: 0, padding: '10px 0', color: '#666' }}>
                            {formatDate(user.created_at)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bouton retour */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px 30px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Retour au tableau de bord
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;