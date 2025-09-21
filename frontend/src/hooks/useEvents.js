import { useState, useEffect } from 'react';
import { useApi } from '../contexts/AuthContext';

export const useEvents = () => {
    const { get } = useApi();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await get('/api/events');
                setEvents(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return { events, loading };
};
