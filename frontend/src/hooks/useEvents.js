// frontend/src/hooks/useEvents.js
import { useState, useEffect, useRef } from 'react';
import { useApi } from '../contexts/AuthContext';

// Helper pour logs conditionnels
const DEBUG = import.meta.env.DEV;
const debug = (...args) => {
  if (DEBUG) console.log(...args);
};
const debugError = (...args) => {
  if (DEBUG) console.error(...args);
};

export const useEvents = (endpoint = '/api/events') => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { get } = useApi();
    
    const isFetchingRef = useRef(false);
    const lastEndpointRef = useRef(null);

    const fetchEvents = async () => {
        if (isFetchingRef.current) {
            debug('⚠️ Fetch déjà en cours, ignoré');
            return;
        }

        if (lastEndpointRef.current === endpoint && events.length > 0) {
            debug('📋 Données déjà en cache pour', endpoint);
            setLoading(false);
            return;
        }

        isFetchingRef.current = true;
        
        try {
            setLoading(true);
            setError(null);
            
            debug('🔄 Fetching events from:', endpoint);
            const response = await get(endpoint);
            debug('✅ API Response:', response.data);
            
            let eventsData = [];
            
            if (endpoint.includes('/my-events')) {
                const { created_events = [], reserved_events = [] } = response.data;
                eventsData = [...created_events, ...reserved_events];
            } else {
                eventsData = response.data.events || response.data || [];
            }
            
            debug('📊 Processed events:', eventsData.length, 'événements');
            setEvents(eventsData);
            lastEndpointRef.current = endpoint;
            
        } catch (error) {
            debugError('❌ Erreur lors du chargement des événements:', error);
            setError(error.response?.data?.error || error.message || 'Erreur lors du chargement');
            setEvents([]);
        } finally {
            debug('🏁 setLoading(false)');
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        debug('🚀 useEvents useEffect pour endpoint:', endpoint);

        const loadEvents = async () => {
            if (isMounted) {
                await fetchEvents();
            }
        };

        loadEvents();

        return () => {
            debug('🧹 useEvents cleanup');
            isMounted = false;
        };
    }, [endpoint]);

    const refetch = () => {
        debug('🔄 Refetch manuel demandé');
        lastEndpointRef.current = null;
        fetchEvents();
    };

    return {
        events,
        loading,
        error,
        refetch
    };
};