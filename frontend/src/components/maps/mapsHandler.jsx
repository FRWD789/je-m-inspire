import React, { useEffect } from 'react';
import {APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary} from '@vis.gl/react-google-maps';

export const MapHandler = ({events}) => 
{
    const MarkersComponent = ({events}) =>
    {
        const map = useMap();
        const markerLib = useMapsLibrary('marker');

        useEffect(() =>
        {          
            if (!map || !markerLib) return;
            
            console.log('Événements reçus:', events);
            
            // ✅ FILTRER LES ÉVÉNEMENTS AVEC COORDONNÉES VALIDES
            const validEvents = events.filter(event => {
                const lat = parseFloat(event.localisation?.lat);
                const lng = parseFloat(event.localisation?.lng);
                const isValid = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
                
                if (!isValid) {
                    console.warn('⚠️ Événement sans coordonnées valides ignoré:', event.name, event.localisation);
                }
                
                return isValid;
            });

            console.log(`✅ ${validEvents.length}/${events.length} événements avec coordonnées valides`);

            if (validEvents.length === 0) {
                console.warn('❌ Aucun événement avec coordonnées valides à afficher sur la carte');
                return;
            }

            // Créer les marqueurs uniquement pour les événements valides
            validEvents.forEach(event => {
                const lat = parseFloat(event.localisation.lat);
                const lng = parseFloat(event.localisation.lng);
                
                const marker = new markerLib.AdvancedMarkerElement({
                    map,
                    position: { lat, lng },
                    title: event.name
                });

                marker.addEventListener('mouseover', () => {
                    // Ouvre l'info-bulle avec les détails de l'événement
                    const infoWindow = new google.maps.InfoWindow({
                        content: `<div style="max-width:200px;">
                                    <h3>${event.name}</h3>
                                    <p>${event.description || 'Pas de description disponible.'}</p>
                                    <p><strong>Date:</strong> ${new Date(event.start_date).toLocaleDateString()}</p>
                                    <p><strong>Adresse:</strong> ${event.localisation.address || 'Adresse non disponible'}</p>
                                  </div>`
                    });
                    infoWindow.open(map, marker);
                });

                marker.addEventListener('mouseout', () => {
                    // Fermer l'info-bulle lorsque la souris quitte le marqueur
                    const infoWindows = document.getElementsByClassName('gm-style-iw');
                    for (let i = 0; i < infoWindows.length; i++) {
                        infoWindows[i].style.display = 'none';
                    }
                });

                marker.addEventListener('click', () => {
                    const element = document.getElementById(`event-${event.id}`);
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    element.classList.add('highlight');
                });
            });

            // Centrer la carte sur le premier événement valide
            const firstEvent = validEvents[0];
            const firstLat = parseFloat(firstEvent.localisation.lat);
            const firstLng = parseFloat(firstEvent.localisation.lng);
            map.panTo({ lat: firstLat, lng: firstLng });
            
        }, [markerLib, map]);
        

        return <></>;
    };
    
    return (
        
        <>
        <div>
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
                <Map
                    mapId='DEMO_MAP_ID'
                    style={{height: '50vh'}}
                    defaultZoom={13}
                    defaultCenter={ { lat: 45.40124220000001, lng: -71.8899362 } } // Centre par défaut (Sherbrooke)
                    mapTypeControl={false}
                    streetView={false}
                    streetViewControl={false}
                    >

                </Map>
                {events && events.length > 0 && (
                    <MarkersComponent 
                        events={events}>    
                    </MarkersComponent>
                )}
            </APIProvider>          
        </div>
        </>
    );
};

// ✅ FONCTION GEOCODE EXPORTÉE
export function geocode(address, geocodingLib) {
    return new Promise((resolve, reject) => {
        if (!geocodingLib) {
            reject(new Error('Bibliothèque de géocodage non disponible'));
            return;
        }

        // Créer une instance de Geocoder
        const geocoder = new geocodingLib.Geocoder();

        geocoder
            .geocode({ address: address })
            .then((result) => {
                const { results } = result;
                
                if (results && results.length > 0) {
                    const location = results[0].geometry.location;
                    resolve({
                        lat: location.lat(),
                        lng: location.lng(),
                        formatted_address: results[0].formatted_address
                    });
                } else {
                    reject(new Error('Adresse introuvable. Veuillez entrer une adresse valide et complète (ex: "123 Rue de la Paix, Paris, France")'));
                }
            })
            .catch((error) => {
                console.error("Erreur de géocodage:", error);
                
                // Messages d'erreur personnalisés selon le type d'erreur
                if (error.message && error.message.includes('ZERO_RESULTS')) {
                    reject(new Error('Adresse introuvable. Vérifiez l\'orthographe et assurez-vous d\'inclure la ville et le pays.'));
                } else if (error.message && error.message.includes('INVALID_REQUEST')) {
                    reject(new Error('Format d\'adresse invalide. Exemple valide: "10 Rue de la Paix, Paris, France"'));
                } else if (error.message && error.message.includes('ERROR')) {
                    reject(new Error('Erreur temporaire du service de géolocalisation. Veuillez réessayer dans quelques secondes.'));
                } else {
                    reject(new Error('Impossible de géolocaliser cette adresse. Assurez-vous qu\'elle existe réellement.'));
                }
            });
    });
}