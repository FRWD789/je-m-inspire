import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ReCaptcha from '../common/ReCaptcha';

const RegisterUserForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        last_name: '',
        email: '',
        date_of_birth: '',
        city: '',
        password: '',
        password_confirmation: '',
        role: 'utilisateur',
        profile_picture: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const { registerUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        // Vérifier que reCAPTCHA est validé
        if (!recaptchaToken) {
            setErrors({ recaptcha: 'Veuillez valider le reCAPTCHA' });
            setLoading(false);
            return;
        }
        try {
            // Créer FormData avec le token reCAPTCHA
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    submitData.append(key, formData[key]);
                }
            });
            submitData.append('recaptcha_token', recaptchaToken);

            const response = await registerUser(submitData);
            console.log('✅ Inscription réussie:', response);
            navigate('/', { replace: true });
        } catch (error) {
            console.error('❌ Erreur inscription:', error);
            
            if (error.isValidation && error.message) {
                setErrors(error.message);
            } else if (typeof error.message === 'object') {
                setErrors(error.message);
            } else {
                setErrors({ general: error.message || 'Une erreur est survenue lors de l\'inscription' });
            }
            
            // Reset reCAPTCHA en cas d'erreur
            setRecaptchaToken('');
            if (window.grecaptcha) {
                window.grecaptcha.reset();
            }
        } finally {
            setLoading(false);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            // Validation
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    profile_picture: 'Le fichier doit être une image'
                }));
                return;
            }
            
            if (file.size > 2048 * 1024) { // 2MB
                setErrors(prev => ({
                    ...prev,
                    profile_picture: 'L\'image ne doit pas dépasser 2MB'
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                profile_picture: file
            }));

            // Prévisualisation
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Effacer l'erreur
            if (errors.profile_picture) {
                setErrors(prev => ({
                    ...prev,
                    profile_picture: null
                }));
            }
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            profile_picture: null
        }));
        setImagePreview(null);
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        marginBottom: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        boxSizing: 'border-box'
    };

    const errorStyle = {
        color: '#e74c3c',
        fontSize: '12px',
        marginBottom: '10px'
    };

    const buttonStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: loading ? '#bdc3c7' : '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontWeight: 'bold'
    };

    // 4. Ajouter les callbacks reCAPTCHA avant le return
    const handleRecaptchaVerify = (token) => {
        setRecaptchaToken(token);
        if (errors.recaptcha) {
            setErrors(prev => ({ ...prev, recaptcha: null }));
        }
    };

    const handleRecaptchaExpired = () => {
        setRecaptchaToken('');
        setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA expiré, veuillez revalider' }));
    };

    const handleRecaptchaError = () => {
        setRecaptchaToken('');
        setErrors(prev => ({ ...prev, recaptcha: 'Erreur reCAPTCHA, veuillez recharger la page' }));
    };
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                maxWidth: '500px',
                width: '100%'
            }}>
                <h2 style={{ 
                    textAlign: 'center', 
                    marginBottom: '30px',
                    color: '#2c3e50'
                }}>
                    Inscription Utilisateur
                </h2>

                {errors.general && (
                    <div style={{
                        ...errorStyle,
                        padding: '10px',
                        backgroundColor: '#fee',
                        borderRadius: '4px',
                        marginBottom: '15px'
                    }}>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Image de profil */}
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px',
                            fontWeight: 'bold',
                            color: '#34495e'
                        }}>
                            Photo de profil (optionnel)
                        </label>
                        
                        {imagePreview ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img 
                                    src={imagePreview} 
                                    alt="Prévisualisation" 
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid #3498db'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    style={{
                                        position: 'absolute',
                                        top: '0',
                                        right: '0',
                                        backgroundColor: '#e74c3c',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        cursor: 'pointer',
                                        fontSize: '18px'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <label style={{
                                display: 'inline-block',
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                border: '2px dashed #bdc3c7',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#ecf0f1',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.borderColor = '#3498db'}
                            onMouseLeave={(e) => e.target.style.borderColor = '#bdc3c7'}
                            >
                                <span style={{ fontSize: '40px', color: '#95a5a6' }}>📷</span>
                                <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        )}
                        
                        {errors.profile_picture && (
                            <div style={errorStyle}>{errors.profile_picture}</div>
                        )}
                        <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '8px' }}>
                            JPG, PNG, GIF - Max 2MB
                        </p>
                    </div>

                    {/* Prénom */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Prénom *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                        {errors.name && <div style={errorStyle}>{errors.name}</div>}
                    </div>

                    {/* Nom */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Nom *
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                        {errors.last_name && <div style={errorStyle}>{errors.last_name}</div>}
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                        {errors.email && <div style={errorStyle}>{errors.email}</div>}
                    </div>

                    {/* Date de naissance */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Date de naissance *
                        </label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                        {errors.date_of_birth && <div style={errorStyle}>{errors.date_of_birth}</div>}
                    </div>

                    {/* Ville */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Ville
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            style={inputStyle}
                        />
                        {errors.city && <div style={errorStyle}>{errors.city}</div>}
                    </div>

                    {/* Mot de passe */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Mot de passe *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                        {errors.password && <div style={errorStyle}>{errors.password}</div>}
                    </div>

                    {/* Confirmation mot de passe */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Confirmer le mot de passe *
                        </label>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                        {errors.password_confirmation && <div style={errorStyle}>{errors.password_confirmation}</div>}
                    </div>
                    <ReCaptcha 
                        onVerify={handleRecaptchaVerify}
                        onExpired={handleRecaptchaExpired}
                        onError={handleRecaptchaError}
                    />
                    {errors.recaptcha && (
                        <div style={{ 
                            color: '#e74c3c', 
                            fontSize: '12px', 
                            marginBottom: '10px',
                            textAlign: 'center'
                        }}>
                            {errors.recaptcha}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        style={buttonStyle}
                    >
                        {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                    </button>
                </form>

                <div style={{ 
                    marginTop: '20px', 
                    textAlign: 'center',
                    paddingTop: '20px',
                    borderTop: '1px solid #eee'
                }}>
                    <p style={{ 
                        color: '#7f8c8d',
                        fontSize: '14px',
                        marginBottom: '10px'
                    }}>
                        Vous avez déjà un compte ?
                    </p>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#3498db',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        Se connecter
                    </button>
                </div>

                <div style={{ 
                    marginTop: '15px', 
                    textAlign: 'center'
                }}>
                    <p style={{ 
                        color: '#7f8c8d',
                        fontSize: '14px',
                        marginBottom: '10px'
                    }}>
                        Vous êtes un professionnel ?
                    </p>
                    <button 
                        onClick={() => navigate('/register-professional')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#27ae60',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        S'inscrire comme professionnel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterUserForm;