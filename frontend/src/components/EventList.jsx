import React from 'react';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';

const EventList = () => {
    const { events, loading } = useEvents();
    const { isProfessional } = useAuth();
    

    if (loading) return <p>Chargement des événements...</p>;
console.log('User data:', user);
    console.log('User roles:', user?.roles);
    console.log('isProfessional():', isProfessional());
    return (
        
        <div>
            {isProfessional() && (
                <button
                    style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', borderRadius: '5px' }}
                    onClick={() => alert('Ouvrir formulaire création événement')}
                >
                    Créer un événement
                </button>
            )}

            <h2>Liste des événements</h2>
            {events.length === 0 ? (
                <p>Aucun événement disponible.</p>
            ) : (
                events.map(event => (
                    <div key={event.id} style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '10px' }}>
                        <h3>{event.name}</h3>
                        <p>{event.description}</p>
                        <p>Localisation: {event.localisation?.name}</p>
                        <p>Catégorie: {event.categorie?.name}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default EventList;
