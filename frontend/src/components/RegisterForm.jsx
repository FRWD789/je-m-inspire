// components/RegisterForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRoles } from '../hooks/useRoles';

const RegisterForm = ({ onRegistrationSuccess, onSwitchToLogin }) => {
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
    const { register } = useAuth();

    const { roles, loading: rolesLoading, error: rolesError } = useRoles();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await register(formData);
            onRegistrationSuccess(response);
        } catch (error) {
            console.error('Registration failed:', error);
            
            if (error.isValidation && error.message) {
                console.log('Erreurs de validation reçues:', error.message);
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
        cursor: loading ? 'not-allowed' : 'pointer'
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Inscription</h2>
            
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
                    {errors.name && Array.isArray(errors.name) && <div style={errorStyle}>{errors.name[0]}</div>}
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
                    {errors.last_name && Array.isArray(errors.last_name) && <div style={errorStyle}>{errors.last_name[0]}</div>}
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
                    {errors.email && Array.isArray(errors.email) && <div style={errorStyle}>{errors.email[0]}</div>}
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Sélectionnez votre rôle *
                    </label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        style={{
                            ...inputStyle,
                            borderColor: errors.role ? '#e74c3c' : '#ddd'
                        }}
                        disabled={rolesLoading}
                        required
                    >
                        <option value="utilisateur">Utilisateur</option>
                        <option value="professionnel">Professionnel</option>
                        <option value="admin">Administrateur</option>
                    </select>

                    {rolesError && (
                        <div style={{ color: '#f39c12', fontSize: '12px' }}>
                            Attention: utilisation des rôles par défaut
                        </div>
                    )}
                    {errors.role && (
                        <div style={errorStyle}>
                            {Array.isArray(errors.role) ? errors.role[0] : errors.role}
                        </div>
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
                    {errors.date_of_birth && Array.isArray(errors.date_of_birth) && <div style={errorStyle}>{errors.date_of_birth[0]}</div>}
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
                    {errors.city && Array.isArray(errors.city) && <div style={errorStyle}>{errors.city[0]}</div>}
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Mot de passe"
                        value={formData.password}
                        onChange={handleInputChange}
                        style={{
                            ...inputStyle,
                            borderColor: errors.password ? '#e74c3c' : '#ddd'
                        }}
                        required
                    />
                    {errors.password && Array.isArray(errors.password) && <div style={errorStyle}>{errors.password[0]}</div>}
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
                    {errors.password_confirmation && Array.isArray(errors.password_confirmation) && <div style={errorStyle}>{errors.password_confirmation[0]}</div>}
                </div>

                {errors.general && (
                    <div style={{ ...errorStyle, textAlign: 'center', marginBottom: '15px' }}>
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

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <span style={{ color: '#666' }}>Déjà un compte ? </span>
                <button 
                    onClick={onSwitchToLogin}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#3498db',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Se connecter
                </button>
            </div>
        </div>
    );
};

export default RegisterForm;