import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useApi } from '../../contexts/AuthContext';
import Avatar from '../common/Avatar';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, refreshUser, logout } = useAuth();
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
    
    // États pour l'image de profil
    const [profilePicture, setProfilePicture] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        last_name: '',
        email: '',
        city: '',
        date_of_birth: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                city: user.city || '',
                // ✅ Formater la date pour l'input type="date"
                date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            // Validation
            if (!file.type.startsWith('image/')) {
                setMessage({ 
                    type: 'error', 
                    text: 'Le fichier doit être une image' 
                });
                return;
            }
            
            if (file.size > 2048 * 1024) { // 2MB
                setMessage({ 
                    type: 'error', 
                    text: 'L\'image ne doit pas dépasser 2MB' 
                });
                return;
            }

            setProfilePicture(file);

            // Prévisualisation
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            setMessage({ type: '', text: '' });
        }
    };

    const removeProfilePicture = () => {
        setProfilePicture(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const formDataToSend = new FormData();
            
            // Ajouter tous les champs texte
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Ajouter l'image si elle a été modifiée
            if (profilePicture) {
                formDataToSend.append('profile_picture', profilePicture);
            }

            const response = await post('/api/profile/update', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            await refreshUser();
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
            setEditing(false);
            setProfilePicture(null);
            setImagePreview(null);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Avatar dans l'en-tête */}
                    <Avatar user={user} size={80} />
                    
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
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {isProfessional() && !hasProPlus && (
                        <button
                            onClick={() => navigate('/abonnement')}
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
                                    setProfilePicture(null);
                                    setImagePreview(null);
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

            {/* === SECTION IMAGE DE PROFIL === */}
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '20px'
            }}>
                <h3 style={{ 
                    marginBottom: '20px',
                    color: '#2c3e50',
                    borderBottom: '2px solid #3498db',
                    paddingBottom: '10px'
                }}>
                    Photo de profil
                </h3>

                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '30px',
                    flexWrap: 'wrap'
                }}>
                    {/* Image actuelle ou prévisualisation */}
                    <div style={{ position: 'relative' }}>
                        {imagePreview ? (
                            // Nouvelle image en prévisualisation
                            <img 
                                src={imagePreview} 
                                alt="Prévisualisation" 
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '4px solid #3498db'
                                }}
                            />
                        ) : user?.profile_picture ? (
                            // Image existante
                            <img 
                                src={`http://localhost:8000/storage/${user.profile_picture}`}
                                alt="Photo de profil" 
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '4px solid #ecf0f1'
                                }}
                            />
                        ) : (
                            // Placeholder
                            <div style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                backgroundColor: '#ecf0f1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '60px',
                                color: '#95a5a6'
                            }}>
                                👤
                            </div>
                        )}
                    </div>

                    {/* Boutons de gestion */}
                    <div style={{ flex: 1 }}>
                        {editing ? (
                            <div>
                                <label style={{
                                    display: 'inline-block',
                                    padding: '10px 20px',
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    marginBottom: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    📷 Choisir une photo
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>

                                {(imagePreview || user?.profile_picture) && (
                                    <button
                                        type="button"
                                        onClick={removeProfilePicture}
                                        style={{
                                            display: 'block',
                                            padding: '8px 16px',
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        🗑️ Supprimer la photo
                                    </button>
                                )}

                                <p style={{ 
                                    fontSize: '12px', 
                                    color: '#7f8c8d', 
                                    marginTop: '10px' 
                                }}>
                                    Formats acceptés : JPG, PNG, GIF<br/>
                                    Taille max : 2MB
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p style={{ color: '#555', marginBottom: '10px' }}>
                                    {user?.profile_picture 
                                        ? 'Votre photo de profil est configurée' 
                                        : 'Aucune photo de profil'}
                                </p>
                                <p style={{ fontSize: '12px', color: '#7f8c8d' }}>
                                    Cliquez sur "Modifier le profil" pour changer votre photo
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                                    backgroundColor: editing ? 'white' : '#f5f5f5',
                                    boxSizing: 'border-box'
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
                                    backgroundColor: editing ? 'white' : '#f5f5f5',
                                    boxSizing: 'border-box'
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
                                    backgroundColor: editing ? 'white' : '#f5f5f5',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Ville
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                disabled={!editing}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    backgroundColor: editing ? 'white' : '#f5f5f5',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Date de naissance
                            </label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                disabled={!editing}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    backgroundColor: editing ? 'white' : '#f5f5f5',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* Section comptes liés (pour les professionnels) */}
            {isProfessional() && (
                <div style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Comptes de paiement</h2>
                    
                    {/* Message si pas Pro Plus */}
                    {!hasProPlus && (
                        <div style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffc107',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}>
                            <div style={{ fontSize: '32px' }}>🔒</div>
                            <div>
                                <strong style={{ color: '#856404', fontSize: '16px' }}>
                                    Abonnement Pro Plus requis
                                </strong>
                                <p style={{ margin: '5px 0 0 0', color: '#856404', fontSize: '14px' }}>
                                    Souscrivez à Pro Plus pour lier vos comptes Stripe et PayPal et recevoir des paiements directement.
                                </p>
                                <button
                                    onClick={() => navigate('/abonnement')}
                                    style={{
                                        marginTop: '10px',
                                        padding: '8px 16px',
                                        backgroundColor: '#ffc107',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Découvrir Pro Plus →
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Stripe */}
                        <div style={{
                            padding: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: !hasProPlus && !linkedAccounts.stripe.linked ? 0.6 : 1
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
                            ) : hasProPlus ? (
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
                            ) : (
                                <button
                                    disabled
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#ccc',
                                        color: '#666',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'not-allowed'
                                    }}
                                >
                                    Pro Plus requis
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
                            alignItems: 'center',
                            opacity: !hasProPlus && !linkedAccounts.paypal.linked ? 0.6 : 1
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0' }}>💰 PayPal</h3>
                                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                                    {linkedAccounts.paypal.linked 
                                        ? `Compte lié : ${linkedAccounts.paypal.email || linkedAccounts.paypal.account_id}`
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
                            ) : hasProPlus ? (
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
                            ) : (
                                <button
                                    disabled
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#ccc',
                                        color: '#666',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'not-allowed'
                                    }}
                                >
                                    Pro Plus requis
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Information Pro Plus */}
                    {hasProPlus && (
                        <div style={{
                            marginTop: '15px',
                            padding: '12px',
                            backgroundColor: '#d4edda',
                            border: '1px solid #c3e6cb',
                            borderRadius: '5px',
                            fontSize: '14px',
                            color: '#155724'
                        }}>
                            ✅ <strong>Pro Plus actif :</strong> Vous pouvez lier vos comptes pour recevoir les paiements directement avec une commission automatique de {user?.commission_rate || 10}%.
                        </div>
                    )}
                </div>
            )}

            {/* Zone dangereuse - Suppression de compte */}
            <div style={{
                backgroundColor: '#fff5f5',
                padding: '30px',
                borderRadius: '10px',
                border: '2px solid #ffebee',
                marginTop: '30px'
            }}>
                <h2 style={{ color: '#d32f2f', marginTop: 0 }}>Zone dangereuse</h2>
                <p style={{ color: '#666', marginBottom: '15px' }}>
                    La suppression de votre compte est irréversible. Toutes vos données seront définitivement perdues.
                </p>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Supprimer mon compte
                </button>
            </div>

            {/* Modal de suppression */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
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
                        width: '90%'
                    }}>
                        <h2 style={{ color: '#d32f2f', marginTop: 0 }}>⚠️ Confirmer la suppression</h2>
                        <p>Cette action est irréversible. Veuillez confirmer la suppression de votre compte.</p>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Tapez "SUPPRIMER" pour confirmer
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword('');
                                    setDeleteConfirmation('');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '10px',
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
                                onClick={handleDeleteAccount}
                                disabled={!deletePassword || deleteConfirmation !== 'SUPPRIMER' || deleting}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: '#d32f2f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: (deletePassword && deleteConfirmation === 'SUPPRIMER') ? 'pointer' : 'not-allowed',
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