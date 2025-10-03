// hooks/useEvents.js - VERSION CORRIGÉE
import { useState, useEffect, useRef } from 'react';
import { useApi } from '../contexts/AuthContext';

export const useEvents = (endpoint = '/api/events') => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { get } = useApi();
    
    const isFetchingRef = useRef(false);
    const lastEndpointRef = useRef(null);

    const fetchEvents = async () => {
        // ✅ Empêcher les appels simultanés
        if (isFetchingRef.current) {
            console.log('⚠️ Fetch déjà en cours, ignoré');
            return;
        }

        // ✅ CORRECTION : Vérifier le cache SANS bloquer le loading
        if (lastEndpointRef.current === endpoint && events.length > 0) {
            console.log('📋 Données déjà en cache pour', endpoint);
            setLoading(false);
            return;
        }

        isFetchingRef.current = true;
        
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Fetching events from:', endpoint);
            const response = await get(endpoint);
            console.log('✅ API Response:', response.data);
            
            let eventsData = [];
            
            // Gérer les différents formats de réponse
            if (endpoint.includes('/my-events')) {
                const { created_events = [], reserved_events = [] } = response.data;
                eventsData = [...created_events, ...reserved_events];
            } else {
                eventsData = response.data.events || response.data || [];
            }
            
            console.log('📊 Processed events:', eventsData.length, 'événements');
            setEvents(eventsData);
            lastEndpointRef.current = endpoint;
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des événements:', error);
            setError(error.response?.data?.error || error.message || 'Erreur lors du chargement des événements');
            setEvents([]);
        } finally {
            console.log('🏁 FINALLY: setLoading(false)'); // ✅ LOG AJOUTÉ
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        console.log('🚀 useEvents useEffect pour endpoint:', endpoint);

        const loadEvents = async () => {
            if (isMounted) {
                await fetchEvents();
            }
        };

        loadEvents();

        return () => {
            console.log('🧹 useEvents cleanup');
            isMounted = false;
        };
    }, [endpoint]);

    const refetch = () => {
        console.log('🔄 Refetch manuel demandé');
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