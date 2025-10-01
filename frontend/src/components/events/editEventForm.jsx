import React, { useState } from 'react';
import { useApi } from '../../contexts/AuthContext';

export const EditEventForm = ({ event, onEventUpdated, onCancel }) => {
    const [formData, setFormData] = useState({
        name: event.name || '',
        description: event.description || '',
        start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
        end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
        base_price: event.base_price || '',
        capacity: event.capacity || '',
        max_places: event.max_places || '',
        level: event.level || '',
        priority: event.priority || '5',
        localisation_id: event.localisation_id || '1',
        categorie_event_id: event.categorie_event_id || '1'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { put } = useApi();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await put(`/api/events/${event.id}`, formData);
            alert('Événement modifié avec succès !');
            if (onEventUpdated) onEventUpdated();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data);
            } else {
                alert(error.response?.data?.error || 'Erreur lors de la modification');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
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

    return (
        <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '30px', 
                borderRadius: '8px', 
                maxWidth: '600px', 
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <h2 style={{ marginBottom: '20px' }}>Modifier l'événement</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Nom de l'événement *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                style={{ ...inputStyle, borderColor: errors.name ? '#e74c3c' : '#ddd' }}
                                required
                            />
                            {errors.name && <div style={errorStyle}>{errors.name[0]}</div>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Niveau *
                            </label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleInputChange}
                                style={{ ...inputStyle, borderColor: errors.level ? '#e74c3c' : '#ddd' }}
                                required
                            >
                                <option value="">Sélectionner un niveau</option>
                                <option value="débutant">Débutant</option>
                                <option value="intermédiaire">Intermédiaire</option>
                                <option value="avancé">Avancé</option>
                                <option value="expert">Expert</option>
                            </select>
                            {errors.level && <div style={errorStyle}>{errors.level[0]}</div>}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            style={{ ...inputStyle, borderColor: errors.description ? '#e74c3c' : '#ddd', resize: 'vertical' }}
                            required
                        />
                        {errors.description && <div style={errorStyle}>{errors.description[0]}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Date de début *
                            </label>
                            <input
                                type="datetime-local"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleInputChange}
                                style={{ ...inputStyle, borderColor: errors.start_date ? '#e74c3c' : '#ddd' }}
                                required
                            />
                            {errors.start_date && <div style={errorStyle}>{errors.start_date[0]}</div>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Date de fin *
                            </label>
                            <input
                                type="datetime-local"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                style={{ ...inputStyle, borderColor: errors.end_date ? '#e74c3c' : '#ddd' }}
                                required
                            />
                            {errors.end_date && <div style={errorStyle}>{errors.end_date[0]}</div>}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Prix (€) *
                            </label>
                            <input
                                type="number"
                                name="base_price"
                                value={formData.base_price}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                style={{ ...inputStyle, borderColor: errors.base_price ? '#e74c3c' : '#ddd' }}
                                required
                            />
                            {errors.base_price && <div style={errorStyle}>{errors.base_price[0]}</div>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Capacité totale *
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleInputChange}
                                min="1"
                                style={{ ...inputStyle, borderColor: errors.capacity ? '#e74c3c' : '#ddd' }}
                                required
                            />
                            {errors.capacity && <div style={errorStyle}>{errors.capacity[0]}</div>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Places disponibles *
                            </label>
                            <input
                                type="number"
                                name="max_places"
                                value={formData.max_places}
                                onChange={handleInputChange}
                                min="1"
                                style={{ ...inputStyle, borderColor: errors.max_places ? '#e74c3c' : '#ddd' }}
                                required
                            />
                            {errors.max_places && <div style={errorStyle}>{errors.max_places[0]}</div>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: loading ? '#bdc3c7' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Modification en cours...' : 'Modifier l\'événement'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};