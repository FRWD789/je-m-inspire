import React, { useState } from 'react';
import { useApi, useAuth } from '../../contexts/AuthContext';

export const ReserveEventForm = ({ event, onEventReserved, onCancel }) => {
    const { post } = useApi();
    const { user } = useAuth(); // Récupération du user connecté

    const [formData, setFormData] = useState({
        adults: "1",
        children: "0"
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await post(`/api/operations`, {
                user_id: user?.id,
                event_id: event.id,
                type_operation_id: 2, // Réservation
                adults: Number(formData.adults),
                children: Number(formData.children),
            });

            alert('Réservation effectuée avec succès !');
            if (onEventReserved) onEventReserved();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data);
            } else {
                alert(error.response?.data?.error || 'Erreur lors de la réservation');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                <h2>Réserver un événement</h2>

                {/* Infos événement */}
                <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
                    <h3>{event.name}</h3>
                    <p>{event.description}</p>
                    <p><strong>Début :</strong> {new Date(event.start_date).toLocaleString('fr-FR')}</p>
                    <p><strong>Fin :</strong> {new Date(event.end_date).toLocaleString('fr-FR')}</p>
                    <p><strong>Prix :</strong> {event.base_price} €</p>
                    <p><strong>Places restantes :</strong> {event.available_places}/{event.capacity}</p>
                </div>

                {/* Infos utilisateur */}
                {user && (
                    <div style={{ background: '#e8f4f8', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
                        <strong>Réservé par :</strong> {user.name} {user.last_name} <br />
                        <small style={{ color: '#666' }}>{user.email}</small>
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label>Nombre de personnes</label>
                            <input
                                type="number"
                                name="adults"
                                min="1"
                                value={formData.adults}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>

                        <div>
                            <label>Nombre d'enfants</label>
                            <input
                                type="number"
                                name="children"
                                min="0"
                                value={formData.children}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '8px' }}
                            />
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
                            {loading ? 'Réservation...' : 'Confirmer la réservation'}
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
