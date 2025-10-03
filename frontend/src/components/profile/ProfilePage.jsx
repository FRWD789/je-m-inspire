import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useApi } from '../../contexts/AuthContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, setUser, logout } = useAuth();
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
    
    // États pour la suppression de compte
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleting, setDeleting] = useState(false);
    
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
            console.error('Erreur chargement comptes:', error);
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
        setMessage({ type: '', text: '' });

        try {
            const response = await put('/api/profile/update', formData);
            setUser(response.data.user);
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
            const response = await get(`/api/profile/${provider}/link`);
            
            if (response.data.success && response.data.url) {
                window.location.href = response.data.url;
            } else if (response.data.already_linked) {
                alert(`Un compte ${provider === 'stripe' ? 'Stripe' : 'PayPal'} est déjà lié`);
                fetchLinkedAccounts();
            }
        } catch (error) {
            alert(error.response?.data?.message || `Erreur lors de la liaison ${provider}`);
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
            const response = await deleteApi(`/api/profile/${provider}/unlink`);
            
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

    const handleDeleteAccount = async () => {
        if (deletePassword === '' || deleteConfirmation !== 'SUPPRIMER') {
            alert('Veuillez remplir tous les champs correctement');
            return;
        }

        setDeleting(true);

        try {
            const response = await deleteApi('/api/profile/deleteAccount', {
                data: {
                    password: deletePassword,
                    confirmation: deleteConfirmation
                }
            });

            if (response.data.success) {
                alert('Votre compte a été supprimé avec succès. Vous allez être déconnecté.');
                await logout();
                navigate('/');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Erreur lors de la suppression du compte');
            setDeletePassword('');
            setDeleteConfirmation('');
        } finally {
            setDeleting(false);
        }
    };

    if (!user) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>;
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
                    {isProfessional() && !hasProPlus && (
                        <button
                            onClick={() => navigate('/pro-plus')}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#ffd700',
                                color: '#000',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            ⭐ Passer à Pro Plus
                        </button>
                    )}

                    {!editing ? (
                        <button
                            onClick={() => setEditing(true)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Modifier le profil
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: saving ? 0.6 : 1
                                }}
                            >
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setMessage({ type: '', text: '' });
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Messages */}
            {message.text && (
                <div style={{
                    padding: '15px',
                    marginBottom: '20px',
                    borderRadius: '5px',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Formulaire de profil */}
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '20px'
            }}>
                <h2 style={{ marginTop: 0 }}>Informations personnelles</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Prénom
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={!editing}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    backgroundColor: editing ? 'white' : '#f5f5f5'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Nom
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                disabled={!editing}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    backgroundColor: editing ? 'white' : '#f5f5f5'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!editing}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    backgroundColor: editing ? 'white' : '#f5f5f5'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Date de naissance
                            </label>
                            <input
                                type="date"
                                name="date_de_naissance"
                                value={formData.date_de_naissance}
                                onChange={handleChange}
                                disabled={!editing}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    backgroundColor: editing ? 'white' : '#f5f5f5'
                                }}
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* Comptes liés */}
            {isProfessional() && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ marginTop: 0 }}>Comptes de paiement liés</h2>
                    
                    {/* Stripe */}
                    <div style={{
                        padding: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>💳 Stripe</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                                {linkedAccounts.stripe.linked 
                                    ? `Compte lié : ${linkedAccounts.stripe.account_id}`
                                    : 'Aucun compte lié'}
                            </p>
                        </div>
                        {linkedAccounts.stripe.linked ? (
                            <button
                                onClick={() => handleUnlinkAccount('stripe')}
                                disabled={linkingProvider === 'stripe'}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: linkingProvider === 'stripe' ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {linkingProvider === 'stripe' ? 'Chargement...' : 'Délier'}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleLinkAccount('stripe')}
                                disabled={linkingProvider === 'stripe'}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#635bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: linkingProvider === 'stripe' ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {linkingProvider === 'stripe' ? 'Chargement...' : 'Lier Stripe'}
                            </button>
                        )}
                    </div>

                    {/* PayPal */}
                    <div style={{
                        padding: '15px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0' }}>💰 PayPal</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                                {linkedAccounts.paypal.linked 
                                    ? `Email : ${linkedAccounts.paypal.email || linkedAccounts.paypal.account_id}`
                                    : 'Aucun compte lié'}
                            </p>
                        </div>
                        {linkedAccounts.paypal.linked ? (
                            <button
                                onClick={() => handleUnlinkAccount('paypal')}
                                disabled={linkingProvider === 'paypal'}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: linkingProvider === 'paypal' ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {linkingProvider === 'paypal' ? 'Chargement...' : 'Délier'}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleLinkAccount('paypal')}
                                disabled={linkingProvider === 'paypal'}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#0070ba',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: linkingProvider === 'paypal' ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {linkingProvider === 'paypal' ? 'Chargement...' : 'Lier PayPal'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Zone de danger - Suppression de compte */}
            <div style={{
                backgroundColor: '#fff5f5',
                padding: '30px',
                borderRadius: '10px',
                border: '2px solid #fee',
                boxShadow: '0 2px 8px rgba(220,53,69,0.1)'
            }}>
                <h2 style={{ marginTop: 0, color: '#dc3545' }}>⚠️ Zone de danger</h2>
                <p style={{ color: '#666', marginBottom: '15px' }}>
                    La suppression de votre compte est <strong>irréversible</strong>. Toutes vos données seront 
                    définitivement supprimées, incluant :
                </p>
                <ul style={{ color: '#666', marginBottom: '20px', marginLeft: '20px' }}>
                    <li>Vos événements créés</li>
                    <li>Vos réservations</li>
                    <li>Vos paiements et historique de transactions</li>
                    <li>Vos abonnements (ils seront annulés automatiquement)</li>
                    <li>Toutes vos informations personnelles</li>
                </ul>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    🗑️ Supprimer définitivement mon compte
                </button>
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '10px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0, color: '#dc3545' }}>
                            ⚠️ Confirmer la suppression
                        </h2>
                        <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                            Cette action est <strong style={{ color: '#dc3545' }}>IRRÉVERSIBLE</strong>. 
                            Une fois votre compte supprimé, il sera impossible de le récupérer.
                        </p>

                        <div style={{ 
                            backgroundColor: '#fff3cd', 
                            padding: '15px', 
                            borderRadius: '5px',
                            marginBottom: '20px',
                            border: '1px solid #ffc107'
                        }}>
                            <strong>⚠️ Attention :</strong>
                            <ul style={{ marginTop: '10px', marginBottom: 0, paddingLeft: '20px' }}>
                                <li>Tous vos événements seront supprimés</li>
                                <li>Vos abonnements actifs seront annulés</li>
                                <li>Vos données ne pourront pas être récupérées</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                1️⃣ Entrez votre mot de passe :
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Votre mot de passe"
                                disabled={deleting}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                2️⃣ Tapez "SUPPRIMER" pour confirmer :
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="Tapez SUPPRIMER en majuscules"
                                disabled={deleting}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: deleteConfirmation === 'SUPPRIMER' ? '2px solid #28a745' : '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px'
                                }}
                            />
                            {deleteConfirmation && deleteConfirmation !== 'SUPPRIMER' && (
                                <small style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>
                                    ⚠️ Vous devez taper exactement "SUPPRIMER" en majuscules
                                </small>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword('');
                                    setDeleteConfirmation('');
                                }}
                                disabled={deleting}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: deleting ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                ← Annuler
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting || deletePassword === '' || deleteConfirmation !== 'SUPPRIMER'}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: deletePassword && deleteConfirmation === 'SUPPRIMER' ? '#dc3545' : '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: (deleting || deletePassword === '' || deleteConfirmation !== 'SUPPRIMER') ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    opacity: (deletePassword && deleteConfirmation === 'SUPPRIMER') ? 1 : 0.5
                                }}
                            >
                                {deleting ? '⏳ Suppression...' : '🗑️ Supprimer définitivement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;