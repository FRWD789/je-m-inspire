// src/hooks/useEvents.js
import { useState, useEffect } from 'react';
import { useApi }  from '../contexts/AuthContext';

export const useEvents = (endpoint = '/api/events') => {
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
