import { APIProvider, Map, useMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Calendar, MapPin, Users } from 'lucide-react';

// ✅ CORRECTION: Utiliser la variable d'environnement au lieu d'une clé en dur
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Event Marker Component
const EventMarker = ({ event, onClick, setMarkerRef }) => {
  const handleRef = useCallback((marker) => {
    setMarkerRef(marker, event.id.toString());
  }, [event.id, setMarkerRef]);

  return (
    <AdvancedMarker
      position={{ lat: event.localisation.lat, lng: event.localisation.lng }}
      onClick={() => onClick(event)}
      ref={handleRef}
    >
      <div className="relative cursor-pointer">
        <Pin
          background={'#60993E'}
          borderColor={'#60993E'}
          glyphColor={'#fff'}
        />
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
          {event.available_places}
        </div>
      </div>
    </AdvancedMarker>
  );
};

// Clustered Markers Component
const ClusteredEventMarkers = ({ events, selectedEventId, onEventSelect }) => {
  const [markers, setMarkers] = useState({});
  const clustererRef = useRef(null);

  const selectedEvent = useMemo(
    () => events?.find(e => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  const map = useMap();

  // Initialize clusterer
  useEffect(() => {
    if (!map) return;
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map });
    }
    return () => {
      if (clustererRef.current) clustererRef.current.clearMarkers();
    };
  }, [map]);

  // Update clusterer when markers change
  useEffect(() => {
    if (!clustererRef.current) return;
    clustererRef.current.clearMarkers();
    const markerList = Object.values(markers).filter(Boolean);
    if (markerList.length > 0) {
      clustererRef.current.addMarkers(markerList);
    }
  }, [markers]);

  const setMarkerRef = useCallback((marker, key) => {
    setMarkers(prev => {
      if ((marker && prev[key]) || (!marker && !prev[key])) return prev;
      if (marker) return { ...prev, [key]: marker };
      const newMarkers = { ...prev };
      delete newMarkers[key];
      return newMarkers;
    });
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    onEventSelect(null);
  }, [onEventSelect]);

  const handleMarkerClick = useCallback((event) => {
    onEventSelect(event.id);
  }, [onEventSelect]);

  // 🟢 Center map on selected event
  useEffect(() => {
    if (selectedEvent && map) {
      map.panTo({
        lat: selectedEvent.localisation.lat,
        lng: selectedEvent.localisation.lng
      });
    }
  }, [selectedEventId, selectedEvent, map]);

  return (
    <>
      {events.map(event => (
        <EventMarker
          key={event.id}
          event={event}
          onClick={handleMarkerClick}
          setMarkerRef={setMarkerRef}
        />
      ))}

      {selectedEvent && markers[selectedEventId] && (
        <InfoWindow
          anchor={markers[selectedEventId.toString()]}
          onCloseClick={handleInfoWindowClose}
        >
          <div className="w-[260px] p-3 bg-white rounded-xl shadow-md border border-gray-100">
            {/* Image */}
            <div className="w-full h-[120px] rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-sm">
              {selectedEvent.thumbnail ? (
                <img
                  src={selectedEvent.thumbnail}
                  alt={selectedEvent.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                "No Image"
              )}
            </div>

            <h3 className="text-base font-semibold text-gray-800 truncate">
              {selectedEvent.name}
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              {selectedEvent.categorie?.name} • {selectedEvent.level}
            </p>

            <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
              <MapPin size={14} className="text-gray-400" />
              <span className="truncate">{selectedEvent.localisation?.name}</span>
            </div>

            <div className="flex items-center gap-1 text-gray-600 text-xs mb-2">
              <Calendar size={14} className="text-gray-400" />
              <span>
                {new Date(selectedEvent.start_date).toLocaleDateString()} →{" "}
                {new Date(selectedEvent.end_date).toLocaleDateString()}
              </span>
            </div>

            {selectedEvent.description && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-3">
                {selectedEvent.description}
              </p>
            )}

            <div className="flex items-center justify-between text-sm border-t pt-2 mt-2">
              <span className="font-semibold text-gray-800">
                {selectedEvent.base_price} $
              </span>
              <div className="flex items-center gap-1 text-gray-600 text-xs">
                <Users size={12} className="text-gray-400" />
                {selectedEvent.available_places}/{selectedEvent.max_places}
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const MapEvents = ({ events = [], selectedEventId = null, onEventSelect = () => {} }) => {
  // Vérifier qu'on a des événements avec coordonnées valides
  const validEvents = useMemo(() => {
    return events.filter(e => 
      e.localisation?.lat && 
      e.localisation?.lng &&
      !isNaN(parseFloat(e.localisation.lat)) &&
      !isNaN(parseFloat(e.localisation.lng))
    );
  }, [events]);

  const center = validEvents.length > 0
    ? { lat: parseFloat(validEvents[0].localisation.lat), lng: parseFloat(validEvents[0].localisation.lng) }
    : { lat: 46.0422, lng: -73.1136 }; // Sorel-Tracy par défaut

  // Log pour debug
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🗺️ MapEvents Debug:');
      console.log('  - API Key présente:', !!API_KEY);
      console.log('  - Total événements:', events.length);
      console.log('  - Événements valides:', validEvents.length);
      if (validEvents.length > 0) {
        console.log('  - Premier événement:', validEvents[0].name, 
          'lat:', validEvents[0].localisation.lat, 
          'lng:', validEvents[0].localisation.lng);
      }
    }
  }, [events, validEvents]);

  if (!API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 p-4">
        <div className="text-center">
          <p className="font-semibold mb-2">❌ Clé API Google Maps manquante</p>
          <p className="text-sm">Ajoutez VITE_GOOGLE_MAPS_API_KEY dans votre fichier .env</p>
        </div>
      </div>
    );
  }

  if (validEvents.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 p-4">
        <div className="text-center">
          <p className="font-semibold mb-2">📍 Aucune localisation disponible</p>
          <p className="text-xs">Les événements sans coordonnées GPS ne peuvent pas être affichés</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <APIProvider apiKey={API_KEY}>
        <div style={{ width: '100%', height:'100%', borderRadius: '4px', overflow: 'hidden'}}>
          <Map
            mapId={'bf51a910020fa25a'}
            defaultCenter={center}
            defaultZoom={6}
            gestureHandling={'greedy'}
            mapTypeControl={false}
            streetView={false}
            streetViewControl={false}
            minZoom={4}
          >
            <ClusteredEventMarkers 
              events={validEvents} 
              selectedEventId={selectedEventId}
              onEventSelect={onEventSelect}
            />
          </Map>
        </div>
      </APIProvider>
    </div>
  );
};

export default MapEvents;