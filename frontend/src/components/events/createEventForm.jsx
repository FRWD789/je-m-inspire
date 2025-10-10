import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/AuthContext';
import { geocode } from '../maps/mapsHandler';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { EventImageUploader } from './EventImageUploader';

const DEBUG = import.meta.env.DEV;
const debug = (...args) => {
    if (DEBUG) console.log(...args);
};
const debugError = (...args) => {
    if (DEBUG) console.error(...args);
};

const CreateEventFormContent = ({ onEventCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        base_price: '',
        capacity: '',
        max_places: '',
        level: '',
        priority: '5',
        localisation_address: '',
        localisation_lat: '',
        localisation_lng: '',
        categorie_event_id: '1'
    });
    const [imageData, setImageData] = useState({
        existingImages: [],
        newFiles: [],
        imagesToDelete: []
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [geocoderReady, setGeocoderReady] = useState(false);
    const { post } = useApi();
    const geocodingLib = useMapsLibrary("geocoding");

    useEffect(() => {
        if (geocodingLib) {
            setGeocoderReady(true);
            debug('✅ Bibliothèque de géolocalisation chargée');
        }
    }, [geocodingLib]);

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

    const handleImagesChange = (data) => {
        setImageData(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setGeocoding(true);
        setErrors({});

        try {
            if (!geocodingLib || !geocoderReady) {
                throw new Error('Service de géolocalisation en cours de chargement. Veuillez réessayer dans quelques secondes.');
            }

            debug('Démarrage du géocodage pour:', formData.localisation_address);
            
            const location = await geocode(formData.localisation_address, geocodingLib);
            
            debug('Géocodage réussi:', location);

            // Créer FormData pour envoyer les fichiers
            const eventFormData = new FormData();
            
            // Ajouter tous les champs de l'événement
            Object.keys(formData).forEach(key => {
                eventFormData.append(key, formData[key]);
            });

            // Ajouter les coordonnées
            eventFormData.append('localisation_lat', location.lat);
            eventFormData.append('localisation_lng', location.lng);

            // Ajouter les images
            imageData.newFiles.forEach((file, index) => {
                eventFormData.append(`images[${index}]`, file);
            });

            setGeocoding(false);

            debug('📤 Envoi de l\'événement avec images:', {
                imagesCount: imageData.newFiles.length
            });

            await post('/api/events', eventFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            alert('Événement créé avec succès !');
            
            if (onEventCreated) {
                onEventCreated();
            }

        } catch (error) {
            debugError('❌ Erreur:', error);
            setGeocoding(false);
            
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                alert('Erreur de validation. Vérifiez les champs.');
            } else {
                alert(error.message || error.response?.data?.error || 'Erreur lors de la création de l\'événement');
            }
        } finally {
            setLoading(false);
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
        <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Créer un nouvel événement</h2>

            {/* Images */}
            <EventImageUploader
                existingImages={[]}
                onImagesChange={handleImagesChange}
                maxImages={5}
            />

            {/* Nom */}
            <div style={{ marginBottom: '15px' }}>
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

            {/* Description */}
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
                        Prix de base (€) *
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
                        Capacité *
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

            {/* Niveau */}
            <div style={{ marginBottom: '15px' }}>
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

            {/* Adresse */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Adresse complète *
                </label>
                <input
                    type="text"
                    name="localisation_address"
                    value={formData.localisation_address}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, borderColor: errors.localisation_address ? '#e74c3c' : '#ddd' }}
                    placeholder="Ex: 123 Rue de la Paix, 75001 Paris, France"
                    required
                />
                {errors.localisation_address && <div style={errorStyle}>{errors.localisation_address[0]}</div>}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    L'adresse sera géolocalisée automatiquement
                </div>
            </div>

            {/* Catégorie */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Catégorie *
                </label>
                <select
                    name="categorie_event_id"
                    value={formData.categorie_event_id}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, borderColor: errors.categorie_event_id ? '#e74c3c' : '#ddd' }}
                    required
                >
                    <option value="1">Yoga</option>
                    <option value="2">Méditation</option>
                    <option value="3">Bien-être</option>
                </select>
                {errors.categorie_event_id && <div style={errorStyle}>{errors.categorie_event_id[0]}</div>}
            </div>

            {/* Bouton Submit */}
            <button
                type="submit"
                disabled={loading || geocoding}
                style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: loading || geocoding ? '#95a5a6' : '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: loading || geocoding ? 'not-allowed' : 'pointer'
                }}
            >
                {geocoding ? '📍 Géolocalisation en cours...' : loading ? '⏳ Création en cours...' : '✅ Créer l\'événement'}
            </button>
        </form>
    );
};

export const CreateEventForm = ({ onEventCreated }) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    return (
        <APIProvider apiKey={apiKey}>
            <CreateEventFormContent onEventCreated={onEventCreated} />
        </APIProvider>
    );
};