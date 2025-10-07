import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
        role: 'utilisateur'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { registerUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await registerUser(formData);
            console.log('✅ Inscription réussie:', response);
            
            // ✅ Redirection vers la page d'accueil après inscription
            navigate('/', { replace: true });
            
        } catch (error) {
            console.error('❌ Erreur inscription:', error);
            if (error.isValidation && error.message) {
                setErrors(error.message);
            } else {
                setErrors({ general: error.message || 'Une erreur est survenue' });
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
        fontSize: '14px'
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
                maxWidth: '450px', 
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
                    Créer un compte
                </h2>
                <p style={{
                    textAlign: 'center',
                    color: '#7f8c8d',
                    marginBottom: '30px',
                    fontSize: '14px'
                }}>
                    Inscription en tant qu'utilisateur
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

                    {errors.general && (
                        <div style={{ 
                            ...errorStyle, 
                            textAlign: 'center', 
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