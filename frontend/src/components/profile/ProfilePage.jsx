import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useApi } from '../../contexts/AuthContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const { get, post, put, delete: deleteApi } = useApi();
    
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [linkingProvider, setLinkingProvider] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [hasProPlus, setHasProPlus] = useState(false);
    const [linkedAccounts, setLinkedAccounts] = useState({
        stripe: { linked: false, account_id: null },
        paypal: { linked: false, account_id: null, email: null }
    });
    
    const [formData, setFormData] = useState({
        name: '',
        last_name: '',
        email: '',
        numero_de_telephone: '',
        adresse: '',
        date_de_naissance: '',
        description: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                numero_de_telephone: user.numero_de_telephone || '',
                adresse: user.adresse || '',
                date_de_naissance: user.date_de_naissance || '',
                description: user.description || ''
            });
            checkProPlusStatus();
            fetchLinkedAccounts();
        }
    }, [user]);

    const isProfessional = () => {
        return user?.roles?.some(role => role.role === 'professionnel');
    };

    const checkProPlusStatus = async () => {
        try {
            const response = await get('/api/abonnement/status');
            // Le backend retourne "has_pro_plus" et non "hasActiveSubscription"
            setHasProPlus(response.data.has_pro_plus || false);
        } catch (error) {
            console.error('Erreur vérification Pro Plus:', error);
            setHasProPlus(false);
        }
    };

    const fetchLinkedAccounts = async () => {
        try {
            const response = await get('/api/profile/linked-accounts');
            if (response.data.success) {
                setLinkedAccounts({
                    stripe: response.data.stripe || { linked: false },
                    paypal: response.data.paypal || { linked: false }
                });
            }
        } catch (error) {
            console.error('Erreur chargement comptes liés:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const response = await put('/api/profile/update', formData);
            setUser(response.data.user);
            setMessage({ 
                type: 'success', 
                text: 'Profil mis à jour avec succès' 
            });
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
            
            const response = await get(endpoint);
            
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

    const handleUnlinkAccount = async (provider) => {
        const providerName = provider === 'stripe' ? 'Stripe' : 'PayPal';
        
        if (!window.confirm(`Êtes-vous sûr de vouloir délier votre compte ${providerName} ?`)) {
            return;
        }

        setLinkingProvider(provider);
        
        try {
            const endpoint = provider === 'stripe' 
                ? '/api/profile/stripe/unlink' 
                : '/api/profile/paypal/unlink';
            
            const response = await deleteApi(endpoint);
            
            if (response.data.success) {
                alert(`Compte ${providerName} délié avec succès`);
                await fetchLinkedAccounts();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors de la déliaison');
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
                                onClick={() => linkedAccounts.stripe.linked 
                                    ? handleUnlinkAccount('stripe') 
                                    : handleLinkAccount('stripe')
                                }
                                disabled={linkingProvider !== null}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: linkingProvider === 'stripe' 
                                        ? '#6c757d' 
                                        : linkedAccounts.stripe.linked 
                                            ? '#dc3545' 
                                            : '#635bff',
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
                                {linkingProvider === 'stripe' ? '⏳' : linkedAccounts.stripe.linked ? '🔗' : '💳'} 
                                {linkedAccounts.stripe.linked ? 'Délier Stripe' : 'Lier Stripe'}
                            </button>

                            <button
                                onClick={() => linkedAccounts.paypal.linked 
                                    ? handleUnlinkAccount('paypal') 
                                    : handleLinkAccount('paypal')
                                }
                                disabled={linkingProvider !== null}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: linkingProvider === 'paypal' 
                                        ? '#6c757d' 
                                        : linkedAccounts.paypal.linked 
                                            ? '#dc3545' 
                                            : '#0070ba',
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
                                {linkingProvider === 'paypal' ? '⏳' : linkedAccounts.paypal.linked ? '🔗' : '💰'} 
                                {linkedAccounts.paypal.linked ? 'Délier PayPal' : 'Lier PayPal'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Message de statut */}
            {message.text && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Section Informations du compte */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ margin: 0 }}>Informations du compte</h2>
                    {!editing ? (
                        <button
                            onClick={() => setEditing(true)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            ✏️ Modifier
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setEditing(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: saving ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {saving ? 'Enregistrement...' : '💾 Enregistrer'}
                            </button>
                        </div>
                    )}
                </div>

                {editing ? (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                name="numero_de_telephone"
                                value={formData.numero_de_telephone}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                Adresse
                            </label>
                            <input
                                type="text"
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                Date de naissance
                            </label>
                            <input
                                type="date"
                                name="date_de_naissance"
                                value={formData.date_de_naissance}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px'
                                }}
                            />
                        </div>

                        {isProfessional() && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Description professionnelle
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        )}
                    </form>
                ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <InfoRow label="Email" value={user.email} />
                        <InfoRow label="Téléphone" value={user.numero_de_telephone || 'Non renseigné'} />
                        <InfoRow label="Adresse" value={user.adresse || 'Non renseignée'} />
                        <InfoRow label="Date de naissance" value={formatDate(user.date_de_naissance)} />
                        {isProfessional() && (
                            <InfoRow label="Description" value={user.description || 'Aucune description'} />
                        )}
                    </div>
                )}
            </div>

            {/* Affichage des comptes liés si Pro Plus */}
            {isProfessional() && hasProPlus && (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '30px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ marginBottom: '20px' }}>Comptes de paiement liés</h2>
                    
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {/* Stripe */}
                        <div style={{
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: linkedAccounts.stripe.linked ? '#f0f9ff' : '#f9f9f9'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#635bff' }}>💳 Stripe</h3>
                                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                                        {linkedAccounts.stripe.linked 
                                            ? `Compte lié : ${linkedAccounts.stripe.account_id}` 
                                            : 'Compte non lié'}
                                    </p>
                                </div>
                                <div style={{
                                    padding: '5px 15px',
                                    borderRadius: '20px',
                                    backgroundColor: linkedAccounts.stripe.linked ? '#28a745' : '#6c757d',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {linkedAccounts.stripe.linked ? '✓ Lié' : '✗ Non lié'}
                                </div>
                            </div>
                        </div>

                        {/* PayPal */}
                        <div style={{
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: linkedAccounts.paypal.linked ? '#f0f9ff' : '#f9f9f9'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#0070ba' }}>💰 PayPal</h3>
                                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                                        {linkedAccounts.paypal.linked 
                                            ? `Payer ID : ${linkedAccounts.paypal.account_id}` 
                                            : 'Compte non lié'}
                                    </p>
                                </div>
                                <div style={{
                                    padding: '5px 15px',
                                    borderRadius: '20px',
                                    backgroundColor: linkedAccounts.paypal.linked ? '#28a745' : '#6c757d',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {linkedAccounts.paypal.linked ? '✓ Lié' : '✗ Non lié'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: '20px',
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0'
    }}>
        <span style={{ fontWeight: '500', color: '#666' }}>{label}</span>
        <span style={{ color: '#333' }}>{value}</span>
    </div>
);

export default ProfilePage;