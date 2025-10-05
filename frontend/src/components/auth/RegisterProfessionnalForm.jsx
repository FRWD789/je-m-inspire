import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RegisterProfessionalForm = ({ onRegistrationSuccess }) => {
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
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await register(formData);
            
            if (response.status === 'pending') {
                alert('Votre demande a été envoyée avec succès ! Vous recevrez un email une fois votre compte approuvé.');
            } else {
                onRegistrationSuccess(response);
            }
        } catch (error) {
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

    // Définir les styles
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
        cursor: loading ? 'not-allowed' : 'pointer'
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Inscription Professionnel</h2>
            
            <div>
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
                    <small style={{ color: '#666', fontSize: '12px' }}>
                        {formData.motivation_letter.length}/2000 caractères
                    </small>
                </div>

                {errors.general && (
                    <div style={{ ...errorStyle, textAlign: 'center', marginTop: '15px', marginBottom: '15px' }}>
                        {errors.general}
                    </div>
                )}

                <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    style={buttonStyle}
                >
                    {loading ? 'Inscription en cours...' : 'S\'inscrire comme Professionnel'}
                </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <span style={{ color: '#666' }}>Déjà un compte ? </span>
                <button 
                    onClick={() => window.location.href = '/login'}
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

export default RegisterProfessionalForm;