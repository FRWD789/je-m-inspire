// App.jsx
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, useApi } from './contexts/AuthContext';
import RegisterForm from './components/RegisterForm';
import RoleGuard, { AdminOnly, ProfessionalOnly } from './components/RoleGuard';
import LoginForm from './components/LoginForm';

// Hook pour récupérer les événements
const useEvents = (endpoint = '/api/events') => {
    const { get } = useApi();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await get(endpoint);
            setEvents(response.data.events || response.data || []);
        } catch (err) {
            console.error('Erreur lors du chargement des événements:', err);
            setError('Impossible de charger les événements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [endpoint]);

    return { events, loading, error, refetch: fetchEvents };
};

// Composant pour créer un événement
const CreateEventForm = ({ onEventCreated }) => {
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
        localisation_id: '1',
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
                localisation_id: '1',
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

// Composant pour modifier un événement
const EditEventForm = ({ event, onEventUpdated, onCancel }) => {
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

// Composant pour afficher la liste des événements
const EventList = ({ endpoint = '/api/events', showReserveButton = true, showDeleteButton = false, showEditButton = false, title = "Événements" }) => {
    const { events, loading, error, refetch } = useEvents(endpoint);
    const { post, delete: deleteApi } = useApi();
    const [editingEvent, setEditingEvent] = useState(null);

    const handleReserve = async (eventId) => {
        try {
            await post(`/api/events/${eventId}/reserve`);
            alert('Réservation effectuée avec succès !');
            refetch();
        } catch (error) {
            alert(error.response?.data?.error || 'Erreur lors de la réservation');
        }
    };

    const handleDelete = async (eventId, eventName) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${eventName}" ?`)) {
            try {
                await deleteApi(`/api/events/${eventId}`);
                alert('Événement supprimé avec succès !');
                refetch();
            } catch (error) {
                alert(error.response?.data?.error || 'Erreur lors de la suppression');
            }
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
    };

    const handleEventUpdated = () => {
        setEditingEvent(null);
        refetch();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('fr-FR');
    };

    if (loading) {
        return <div>Chargement des événements...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div>
            <h2>{title}</h2>
            {events.length === 0 ? (
                <p>Aucun événement disponible.</p>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {events.map(event => (
                        <div key={event.id} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '20px',
                            backgroundColor: '#f9f9f9'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{event.name}</h3>
                                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>{event.description}</p>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                        <div><strong>Début:</strong> {formatDate(event.start_date)}</div>
                                        <div><strong>Fin:</strong> {formatDate(event.end_date)}</div>
                                        <div><strong>Prix:</strong> {event.base_price}€</div>
                                        <div><strong>Places:</strong> {event.available_places}/{event.capacity}</div>
                                        <div><strong>Niveau:</strong> {event.level}</div>
                                        {event.localisation && (
                                            <div><strong>Lieu:</strong> {event.localisation.name || 'Non spécifié'}</div>
                                        )}
                                    </div>

                                    {event.creator && (
                                        <div style={{ 
                                            backgroundColor: '#e8f4f8', 
                                            padding: '10px', 
                                            borderRadius: '4px',
                                            marginBottom: '15px'
                                        }}>
                                            <strong>Organisé par:</strong> {event.creator.name} {event.creator.last_name}
                                            <br />
                                            <small style={{ color: '#666' }}>
                                                {event.creator.roles?.join(', ')} • {event.creator.email}
                                            </small>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {showReserveButton && (
                                        <button
                                            onClick={() => handleReserve(event.id)}
                                            disabled={event.available_places <= 0}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: event.available_places > 0 ? '#28a745' : '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: event.available_places > 0 ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {event.available_places > 0 ? 'Réserver' : 'Complet'}
                                        </button>
                                    )}

                                    {showEditButton && (
                                        <button
                                            onClick={() => handleEdit(event)}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#ffc107',
                                                color: '#212529',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Modifier
                                        </button>
                                    )}

                                    {showDeleteButton && (
                                        <button
                                            onClick={() => handleDelete(event.id, event.name)}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Modale d'édition */}
            {editingEvent && (
                <EditEventForm
                    event={editingEvent}
                    onEventUpdated={handleEventUpdated}
                    onCancel={() => setEditingEvent(null)}
                />
            )}
        </div>
    );
};

// Composant de navigation
const Navigation = () => {
    const { user, logout, isProfessional } = useAuth();
    
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav style={{ 
            padding: '1rem', 
            backgroundColor: '#f8f9fa', 
            borderBottom: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div>
                <h3>Mon App Événements</h3>
            </div>
            
            {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>Bonjour, {user.name}</span>
                    <span style={{ 
                        backgroundColor: isProfessional() ? '#28a745' : '#007bff',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>
                        {user.roles?.map(role => role.role).join(', ')}
                    </span>
                    <button 
                        onClick={handleLogout}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Déconnexion
                    </button>
                </div>
            )}
        </nav>
    );
};

// Dashboard principal avec onglets
const EventDashboard = () => {
    const { user, isProfessional } = useAuth();
    const [activeTab, setActiveTab] = useState('events');

    const tabStyle = (isActive) => ({
        padding: '10px 20px',
        backgroundColor: isActive ? '#007bff' : '#f8f9fa',
        color: isActive ? 'white' : '#007bff',
        border: '1px solid #007bff',
        cursor: 'pointer',
        marginRight: '5px',
        borderRadius: '4px 4px 0 0'
    });

    return (
        <div style={{ padding: '20px' }}>
            {/* Onglets de navigation */}
            <div style={{ marginBottom: '20px', borderBottom: '1px solid #dee2e6' }}>
                <button
                    onClick={() => setActiveTab('events')}
                    style={tabStyle(activeTab === 'events')}
                >
                    Tous les événements
                </button>
                
                {isProfessional() && (
                    <>
                        <button
                            onClick={() => setActiveTab('create')}
                            style={tabStyle(activeTab === 'create')}
                        >
                            Créer un événement
                        </button>
                        <button
                            onClick={() => setActiveTab('myEvents')}
                            style={tabStyle(activeTab === 'myEvents')}
                        >
                            Mes événements
                        </button>
                    </>
                )}
            </div>

            {/* Contenu des onglets */}
            <div style={{ minHeight: '400px' }}>
                {activeTab === 'events' && (
                    <EventList 
                        title="Événements disponibles" 
                        showReserveButton={true} 
                    />
                )}

                {activeTab === 'create' && (
                    <ProfessionalOnly fallback={<p>Accès réservé aux professionnels</p>}>
                        <div>
                            <h2>Créer un nouvel événement</h2>
                            <CreateEventForm onEventCreated={() => setActiveTab('events')} />
                        </div>
                    </ProfessionalOnly>
                )}

                {activeTab === 'myEvents' && (
                    <ProfessionalOnly fallback={<p>Accès réservé aux professionnels</p>}>
                        <EventList 
                            endpoint="/api/events/my" 
                            title="Mes événements créés"
                            showReserveButton={false} 
                            showDeleteButton={true}
                            showEditButton={true}
                        />
                    </ProfessionalOnly>
                )}
            </div>
        </div>
    );
};

// Composant principal de l'app
const AppContent = () => {
    const { isAuthenticated, loading, isInitialized } = useAuth();
    const [showRegister, setShowRegister] = useState(false);

    if (!isInitialized || loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>Chargement de l'application...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div>
                {showRegister ? (
                    <RegisterForm 
                        onRegistrationSuccess={() => setShowRegister(false)}
                        onSwitchToLogin={() => setShowRegister(false)}
                    />
                ) : (
                    <div>
                        <LoginForm />
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <span>Pas encore de compte ? </span>
                            <button 
                                onClick={() => setShowRegister(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#007bff',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                S'inscrire
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <Navigation />
            <EventDashboard />
        </div>
    );
};

// App principale avec le Provider
const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;