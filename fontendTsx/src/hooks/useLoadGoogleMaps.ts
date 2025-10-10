import { useEffect, useState } from "react";

export function useLoadGoogleMaps(apiKey: string) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`;
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => console.error("Échec de chargement de Google Maps API");
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [apiKey]);

  return loaded;
}
