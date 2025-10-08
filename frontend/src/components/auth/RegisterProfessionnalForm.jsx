import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DEBUG = import.meta.env.DEV;
const debug = (...args) => {
  if (DEBUG) console.log(...args);
};
const debugError = (...args) => {
  if (DEBUG) console.error(...args);
};
const debugGroup = (...args) => {
  if (DEBUG) console.group(...args);
};
const debugGroupEnd = () => {
  if (DEBUG) console.groupEnd();
};

const RegisterProfessionalForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        last_name: '',
        email: '',
        date_of_birth: '',
        city: '',
        password: '',
        password_confirmation: '',
        role: 'professionnel',
        motivation_letter: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const { registerProfessional } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await registerProfessional(formData);
            debug('✅ Inscription professionnel:', response);
            
            if (response.status === 'pending') {
                // ✅ Afficher le message de succès
                setShowSuccessMessage(true);
                
                // ✅ Rediriger vers la page de connexion après 5 secondes
                setTimeout(() => {
                    navigate('/login', { 
                        replace: true,
                        state: { 
                            message: 'Votre demande a été envoyée. Vous recevrez un email une fois approuvé.' 
                        }
                    });
                }, 5000);
            }
        } catch (error) {
            debugError('❌ Erreur inscription professionnel:', error);
            if (error.isValidation && error.message) {
                setErrors(error.message);
            } else if (typeof error.message === 'object') {
                setErrors(error.message);
            } else {
                setErrors({ general: error.message || 'Une erreur est survenue lors de l\'inscription' });
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
        backgroundColor: loading ? '#bdc3c7' : '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontWeight: 'bold'
    };

    // ✅ Afficher le message de succès si la demande est en attente
    if (showSuccessMessage) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                padding: '20px'
            }}>
                <div style={{
                    maxWidth: '500px',
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
                    <h2 style={{ color: '#27ae60', marginBottom: '20px' }}>
                        Demande envoyée avec succès !
                    </h2>
                    <p style={{ color: '#555', marginBottom: '15px', lineHeight: '1.6' }}>
                        Votre demande d'inscription en tant que professionnel a été transmise à notre équipe.
                    </p>
                    <p style={{ color: '#555', marginBottom: '30px', lineHeight: '1.6' }}>
                        Vous recevrez un email de confirmation une fois votre compte approuvé par un administrateur.
                    </p>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#d4edda',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        border: '1px solid #c3e6cb'
                    }}>
                        <small style={{ color: '#155724' }}>
                            Redirection vers la page de connexion dans quelques secondes...
                        </small>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        Aller à la connexion maintenant
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '550px',
                width: '100%',
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '10px',
                    color: '#2c3e50',
                    fontSize: '28px'
                }}>
                    Inscription Professionnel
                </h2>
                <p style={{
                    textAlign: 'center',
                    color: '#7f8c8d',
                    marginBottom: '30px',
                    fontSize: '14px'
                }}>
                    Votre demande sera examinée par notre équipe
                </p>

                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Prénom"
                            value={formData.name}
                            onChange={handleInputChange}
                            style={{
                                ...inputStyle,
                                borderColor: errors.name ? '#e74c3c' : '#ddd'
                            }}
                            required
                        />
                        {errors.name && Array.isArray(errors.name) && (
                            <div style={errorStyle}>{errors.name[0]}</div>
                        )}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Nom de famille"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            style={{
                                ...inputStyle,
                                borderColor: errors.last_name ? '#e74c3c' : '#ddd'
                            }}
                            required
                        />
                        {errors.last_name && Array.isArray(errors.last_name) && (
                            <div style={errorStyle}>{errors.last_name[0]}</div>
                        )}
                    </div>

                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Adresse email"
                            value={formData.email}
                            onChange={handleInputChange}
                            style={{
                                ...inputStyle,
                                borderColor: errors.email ? '#e74c3c' : '#ddd'
                            }}
                            required
                        />
                        {errors.email && Array.isArray(errors.email) && (
                            <div style={errorStyle}>{errors.email[0]}</div>
                        )}
                    </div>

                    <div>
                        <input
                            type="date"
                            name="date_of_birth"
                            placeholder="Date de naissance"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            style={{
                                ...inputStyle,
                                borderColor: errors.date_of_birth ? '#e74c3c' : '#ddd'
                            }}
                            required
                        />
                        {errors.date_of_birth && Array.isArray(errors.date_of_birth) && (
                            <div style={errorStyle}>{errors.date_of_birth[0]}</div>
                        )}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="city"
                            placeholder="Ville (optionnel)"
                            value={formData.city}
                            onChange={handleInputChange}
                            style={{
                                ...inputStyle,
                                borderColor: errors.city ? '#e74c3c' : '#ddd'
                            }}
                        />
                        {errors.city && Array.isArray(errors.city) && (
                            <div style={errorStyle}>{errors.city[0]}</div>
                        )}
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Mot de passe (min. 6 caractères)"
                            value={formData.password}
                            onChange={handleInputChange}
                            style={{
                                ...inputStyle,
                                borderColor: errors.password ? '#e74c3c' : '#ddd'
                            }}
                            required
                        />
                        {errors.password && Array.isArray(errors.password) && (
                            <div style={errorStyle}>{errors.password[0]}</div>
                        )}
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password_confirmation"
                            placeholder="Confirmer le mot de passe"
                            value={formData.password_confirmation}
                            onChange={handleInputChange}
                            style={{
                                ...inputStyle,
                                borderColor: errors.password_confirmation ? '#e74c3c' : '#ddd'
                            }}
                            required
                        />
                        {errors.password_confirmation && Array.isArray(errors.password_confirmation) && (
                            <div style={errorStyle}>{errors.password_confirmation[0]}</div>
                        )}
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#333',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            Lettre de motivation *
                        </label>
                        <textarea
                            name="motivation_letter"
                            placeholder="Expliquez pourquoi vous souhaitez devenir professionnel sur notre plateforme (minimum 50 caractères)"
                            value={formData.motivation_letter}
                            onChange={handleInputChange}
                            rows="6"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: errors.motivation_letter ? '1px solid #e74c3c' : '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                                fontFamily: 'Arial, sans-serif'
                            }}
                            required
                        />
                        {errors.motivation_letter && (
                            <div style={errorStyle}>
                                {Array.isArray(errors.motivation_letter) ? errors.motivation_letter[0] : errors.motivation_letter}
                            </div>
                        )}
                        <small style={{ 
                            color: formData.motivation_letter.length < 50 ? '#e74c3c' : '#666', 
                            fontSize: '12px' 
                        }}>
                            {formData.motivation_letter.length}/2000 caractères
                            {formData.motivation_letter.length < 50 && ' (minimum 50 requis)'}
                        </small>
                    </div>

                    {errors.general && (
                        <div style={{
                            ...errorStyle,
                            textAlign: 'center',
                            marginTop: '15px',
                            marginBottom: '15px',
                            padding: '10px',
                            backgroundColor: '#fee',
                            borderRadius: '4px'
                        }}>
                            {errors.general}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={buttonStyle}
                    >
                        {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
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
                        Inscription simple utilisateur ?
                    </p>
                    <button
                        onClick={() => navigate('/register-user')}
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
                        S'inscrire comme utilisateur
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterProfessionalForm;