import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/AuthContext';
import { geocode } from '../maps/mapsHandler';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';

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
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [geocoderReady, setGeocoderReady] = useState(false);
    const { post } = useApi();
    const geocodingLib = useMapsLibrary("geocoding");

    // Vérifier quand la bibliothèque de géocodage est prête
    useEffect(() => {
        if (geocodingLib) {
            setGeocoderReady(true);
            console.log('✅ Bibliothèque de géolocalisation chargée');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setGeocoding(true);
        setErrors({});

        try {
            // ✅ VÉRIFICATION DE LA BIBLIOTHÈQUE DE GÉOCODAGE
            if (!geocodingLib || !geocoderReady) {
                throw new Error('Service de géolocalisation en cours de chargement. Veuillez réessayer dans quelques secondes.');
            }

            console.log('Démarrage du géocodage pour:', formData.localisation_address);
            
            const location = await geocode(formData.localisation_address, geocodingLib);
            
            console.log('Géocodage réussi:', location);

            // ✅ MISE À JOUR DES COORDONNÉES
            const eventData = {
                ...formData,
                localisation_lat: location.lat,
                localisation_lng: location.lng
            };

            setGeocoding(false);

            // ✅ ENVOI DE L'ÉVÉNEMENT AVEC LES COORDONNÉES
            await post('/api/events', eventData);
            
            alert('Événement créé avec succès !');
            
            // Réinitialiser le formulaire
            setFormData({
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

            if (onEventCreated) {
                onEventCreated();
            }

        } catch (error) {
            console.error('Erreur lors de la création:', error);
            
            // Gérer les erreurs de géocodage spécifiquement
            if (error.message && (
                error.message.includes('Adresse introuvable') || 
                error.message.includes('géolocaliser') ||
                error.message.includes('Format d\'adresse') ||
                error.message.includes('service de géolocalisation')
            )) {
                // Erreur de géocodage - message spécifique
                setErrors({
                    localisation_address: [error.message]
                });
                alert(`❌ Problème avec l'adresse:\n\n${error.message}\n\nVeuillez corriger l'adresse et réessayer.`);
            } else if (error.response?.data?.errors) {
                // Erreurs de validation backend
                setErrors(error.response.data.errors);
            } else if (error.message) {
                alert(`Erreur: ${error.message}`);
            } else {
                alert('Erreur lors de la création de l\'événement');
            }
        } finally {
            setLoading(false);
            setGeocoding(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    };

    const errorStyle = {
        color: '#e74c3c',
        fontSize: '12px',
        marginTop: '5px'
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Créer un nouvel événement</h2>

            {/* Indicateur de chargement du service */}
            {!geocoderReady && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    color: '#856404'
                }}>
                    ⏳ Chargement du service de géolocalisation...
                </div>
            )}

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

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Adresse * (sera géolocalisée automatiquement)
                </label>
                <input
                    type="text"
                    name="localisation_address"
                    value={formData.localisation_address}
                    onChange={handleInputChange}
                    placeholder="Ex: 123 Rue de la Paix, Paris, France"
                    style={{ ...inputStyle, borderColor: errors.localisation_address ? '#e74c3c' : '#ddd' }}
                    required
                />
                {errors.localisation_address && <div style={errorStyle}>{errors.localisation_address[0]}</div>}
                {geocoding && (
                    <div style={{ color: '#3498db', fontSize: '12px', marginTop: '5px' }}>
                        🌍 Géolocalisation en cours...
                    </div>
                )}
                <div style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginTop: '5px',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                }}>
                    💡 <strong>Conseil:</strong> Entrez une adresse complète et réelle avec la rue, ville et pays
                    <br />
                    ✅ Exemples valides:
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>"Tour Eiffel, Paris, France"</li>
                        <li>"1600 Amphitheatre Parkway, Mountain View, CA, USA"</li>
                        <li>"Big Ben, London, UK"</li>
                    </ul>
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
                    rows="4"
                    style={{ ...inputStyle, borderColor: errors.description ? '#e74c3c' : '#ddd', resize: 'vertical' }}
                    required
                />
                {errors.description && <div style={errorStyle}>{errors.description[0]}</div>}
            </div>

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
                    <option value="débutant">Débutant</option>
                    <option value="intermédiaire">Intermédiaire</option>
                    <option value="avancé">Avancé</option>
                    <option value="expert">Expert</option>
                </select>
                {errors.level && <div style={errorStyle}>{errors.level[0]}</div>}
            </div>

            <button
                type="submit"
                disabled={loading || geocoding || !geocoderReady}
                style={{
                    padding: '12px 24px',
                    backgroundColor: (loading || geocoding || !geocoderReady) ? '#bdc3c7' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: (loading || geocoding || !geocoderReady) ? 'not-allowed' : 'pointer',
                    marginTop: '20px',
                    width: '100%'
                }}
            >
                {!geocoderReady ? '⏳ Chargement du service...' : 
                 geocoding ? '🌍 Géolocalisation...' : 
                 loading ? 'Création en cours...' : 
                 'Créer l\'événement'}
            </button>
        </form>
    );
};

// Wrapper avec APIProvider
export const CreateEventForm = ({ onEventCreated }) => {
    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <CreateEventFormContent onEventCreated={onEventCreated} />
        </APIProvider>
    );
};