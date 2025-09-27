import { useState, useEffect } from 'react';
import { useApi } from '../contexts/AuthContext';

export const useEvents = (endpoint = '/api/events') => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { get } = useApi();

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await get(endpoint);
            console.log('API Response:', response.data);
            
            let eventsData = [];
            
            // Gérer les différents formats de réponse
            if (endpoint.includes('/my-events')) {
                // Pour /api/my-events, combiner created_events et reserved_events
                const { created_events = [], reserved_events = [] } = response.data;
                eventsData = [...created_events, ...reserved_events];
            } else {
                // Pour /api/events, utiliser le format standard
                eventsData = response.data.events || response.data || [];
            }
            
            console.log('Processed events:', eventsData);
            setEvents(eventsData);
            
        } catch (error) {
            console.error('Erreur lors du chargement des événements:', error);
            setError(error.response?.data?.error || error.message || 'Erreur lors du chargement des événements');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [endpoint]);

    const refetch = () => {
        fetchEvents();
    };

    return {
        events,
        loading,
        error,
        refetch
    };
};