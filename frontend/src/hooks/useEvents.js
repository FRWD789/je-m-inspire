// hooks/useEvents.js - VERSION CORRIGÉE
import { useState, useEffect, useRef } from 'react';
import { useApi } from '../contexts/AuthContext';

export const useEvents = (endpoint = '/api/events') => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { get } = useApi();
    
    // ✅ FIX 1: Utiliser useRef pour suivre si un fetch est en cours
    const isFetchingRef = useRef(false);
    
    // ✅ FIX 2: Utiliser useRef pour suivre le dernier endpoint fetché
    const lastEndpointRef = useRef(null);

    const fetchEvents = async () => {
        // ✅ Empêcher les appels simultanés
        if (isFetchingRef.current) {
            console.log('⚠️ Fetch déjà en cours, ignoré');
            return;
        }

        // ✅ Éviter de refetch le même endpoint
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
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadEvents = async () => {
            if (isMounted) {
                await fetchEvents();
            }
        };

        loadEvents();

        // ✅ Cleanup pour éviter les updates sur composant démonté
        return () => {
            isMounted = false;
        };
    }, [endpoint]); // Dépendance endpoint OK avec les protections ci-dessus

    const refetch = () => {
        // ✅ Reset le cache pour forcer un nouveau fetch
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