import React, { useState } from 'react';
import { useApi } from '../../contexts/AuthContext';
import { EventImageUploader } from './EventImageUploader';

export const EditEventForm = ({ event, onEventUpdated, onCancel, onClose }) => {
    // Supporter les deux noms de props pour la compatibilité
    const handleCancel = onClose || onCancel;
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
        localisation_id: event.localisation?.id || event.localisation_id || '1',
        categorie_event_id: event.categorie?.id || event.categorie_event_id || '1'
    });
    const [imageData, setImageData] = useState({
        existingImages: event.images || [],
        newFiles: [],
        imagesToDelete: []
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { put } = useApi();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Créer FormData pour envoyer les fichiers
            const eventFormData = new FormData();

            // Ajouter les champs de l'événement qui ont changé
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    eventFormData.append(key, formData[key]);
                }
            });

            // Ajouter les nouvelles images
            imageData.newFiles.forEach((file, index) => {
                eventFormData.append(`images[${index}]`, file);
            });

            // Ajouter les IDs des images à supprimer
            imageData.imagesToDelete.forEach((id, index) => {
                eventFormData.append(`delete_images[${index}]`, id);
            });

            // Ajouter le nouvel ordre des images existantes
            imageData.existingImages.forEach((img, index) => {
                eventFormData.append(`images_order[${index}]`, img.id);
            });

            console.log('📤 Envoi des modifications:', {
                newImagesCount: imageData.newFiles.length,
                imagesToDelete: imageData.imagesToDelete,
                imagesOrder: imageData.existingImages.map(img => img.id)
            });

            await put(`/api/events/${event.id}`, eventFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Événement modifié avec succès !');
            
            if (onEventUpdated) {
                onEventUpdated();
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                alert('Erreur de validation. Vérifiez les champs.');
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

    const handleImagesChange = (data) => {
        setImageData(data);
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
        <div 
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                zIndex: 1000,
                overflowY: 'auto',
                padding: '20px'
            }}
            onClick={handleCancel}
        >
            <div 
                style={{ 
                    backgroundColor: 'white', 
                    padding: '30px', 
                    borderRadius: '8px', 
                    maxWidth: '800px', 
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Bouton fermer */}
                <button
                    onClick={handleCancel}
                    disabled={loading}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        color: '#999',
                        padding: '5px 10px',
                        lineHeight: '1',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#333'}
                    onMouseLeave={(e) => e.target.style.color = '#999'}
                >
                    ✕
                </button>

                <h2 style={{ marginBottom: '20px' }}>Modifier l'événement</h2>
                
                <form onSubmit={handleSubmit}>
                    {/* Gestion des images */}
                    <EventImageUploader
                        existingImages={event.images || []}
                        onImagesChange={handleImagesChange}
                        maxImages={5}
                    />

                    {/* Nom et Description */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
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
                                <option value="Débutant">Débutant</option>
                                <option value="Intermédiaire">Intermédiaire</option>
                                <option value="Avancé">Avancé</option>
                                <option value="Expert">Expert</option>
                                <option value="Tous niveaux">Tous niveaux</option>
                            </select>
                            {errors.level && <div style={errorStyle}>{errors.level[0]}</div>}
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            style={{ ...inputStyle, borderColor: errors.description ? '#e74c3c' : '#ddd' }}
                            required
                        />
                        {errors.description && <div style={errorStyle}>{errors.description[0]}</div>}
                    </div>

                    {/* Dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
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

                    {/* Prix, Capacité, Places */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '15px' }}>
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
                                Places max *
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

                    {/* Boutons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: loading ? '#95a5a6' : '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? '⏳ Enregistrement...' : '✅ Enregistrer les modifications'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#95a5a6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer'
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