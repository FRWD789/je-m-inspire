import React, { useState } from 'react';
import { useApi } from '../../contexts/AuthContext';
//import { geocode } from '../maps/mapsHandler';
import { useMapsLibrary } from '@vis.gl/react-google-maps';


export const CreateEventForm = ({ onEventCreated }) => {
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
    const { post } = useApi();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {

            /*
            const geocoder = useMapsLibrary("geocoding");
            geocode(formData["localisation_address"], geocoder, function(location){

                console.log("LOCATION : " + location.lat() + "|" + location.lng());

                formData["localisation_lat"] = location.lat();
                formData["localisation_lng"] = location.lng();

            });

            */
           
            await post('/api/events', formData);
            alert('Événement créé avec succès !');
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
            if (onEventCreated) onEventCreated();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.error || 'Erreur lors de la création');
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
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
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
                    Adresse *
                </label>
                <input
                        type="text"
                        name="localisation_address"
                        value={formData.name}
                        onChange={handleInputChange}
                        style={{ ...inputStyle, borderColor: errors.name ? '#e74c3c' : '#ddd' }}
                        required
                    />
                    {errors.name && <div style={errorStyle}>{errors.address[0]}</div>}
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

            <div>
                <div>
                    <input type="hidden" id="localisation_lat" name="localisation_lat" value="0"/>
                    <input type="hidden" id="localisation_lng" name="localisation_lng" value="0"/>
                </div>
            </div>

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
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '20px'
                }}
            >
                {loading ? 'Création en cours...' : 'Créer l\'événement'}
            </button>
        </form>
    );
};