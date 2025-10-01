import React, { useEffect } from 'react';
import {APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary} from '@vis.gl/react-google-maps';

export const MapLoader = ({events}) => 
{
    //variable/const
    const MarkersComponent = ({events}) =>
    {
        const map = useMap();
        const markerLib = useMapsLibrary('marker');

        useEffect(() =>
        {          
          if (!map || !markerLib) return;

          events.forEach(event => {
       
            const marker = new markerLib.AdvancedMarkerElement({
                map,
                position: { lat: parseFloat(event.localisation.latitude), lng: parseFloat(event.localisation.longitude) }
            });
        });

        map.panTo({ lat: parseFloat(events[0].localisation.latitude), lng: parseFloat(events[0].localisation.longitude) });
        }, [markerLib, map]);
        

        return <></>;
    };
    
    return (
        
        <>
        <div>
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
                <Map
                    mapId='DEMO_MAP_ID'
                    style={{width: '95vw', height: '100vh'}}
                    defaultZoom={13}
                    defaultCenter={ { lat: 45.40124220000001, lng: -71.8899362 } }
                    mapTypeControl={false}
                    streetView={false}
                    streetViewControl={false}
                    >

                </Map>
                <MarkersComponent 
                    events={events}>    
                </MarkersComponent>
            </APIProvider>          
        </div>
        </>
    );
};

function geocode(request, geocoder, callback) {
    
    geocoder
      .geocode(request)
      .then((result) => {
        const { results } = result;
        const { status } = status;

        if(status === 'OK')
        {
            callback(results[0].geometry.location);
        }
        else
        {
            console.log("Houston, we got a problem : " + status);
        }
      })
      .catch((e) => {
        console.log("Geocode was not successful for the following reason: " + e);
      });
  
}