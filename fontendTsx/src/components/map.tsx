import { APIProvider, Map, useMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Calendar, MapPin, Users } from 'lucide-react';

const API_KEY = "AIzaSyCLD-sPCtHIZVGtpp8K-ok97RR26UStQqM";

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
              {selectedEvent.image_url ? (
                <img
                  src={selectedEvent.image_url}
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
                {selectedEvent.base_price} €
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
  const center = events.length > 0
    ? { lat: events[0].localisation.lat, lng: events[0].localisation.lng }
    : { lat: 48.8566, lng: 2.3522 };

  return (
    <div className="relative w-full h-full">
      <APIProvider apiKey={API_KEY}>
        <div style={{ width: '100%',height:'100%', borderRadius: '4px', overflow: 'hidden'}}>
          <Map
            mapId={'bf51a910020fa25a'}
            defaultCenter={center}
            defaultZoom={6}
            gestureHandling={'greedy'}
            mapTypeControl={false}
            streetView={false}
            streetViewControl={false}
            
          >
            <ClusteredEventMarkers 
              events={events} 
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
