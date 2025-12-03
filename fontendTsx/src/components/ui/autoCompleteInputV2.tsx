import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2, X } from "lucide-react";

type AutocompletePrediction = {
  description: string;
  placeId: string;
};

type AutocompleteInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  placeholder?: string;
};

export default function AutocompleteInputV2({
  name,
  placeholder = "Rechercher une adresse...",
  ...rest
}: AutocompleteInputProps) {
  const { register, setValue, watch } = useFormContext();
  const inputValue = watch(name);
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false); // ✅ Contrôle explicite de l'affichage
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Wait for google.maps.places to exist
  useEffect(() => {
    const initToken = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      } else {
        setTimeout(initToken, 100);
      }
    };
    initToken();
  }, []);

  // Fetch suggestions from Google Places
  const fetchSuggestions = useCallback((input: string) => {
    if (!window.google || !window.google.maps?.places || !sessionTokenRef.current) return;
    if (!input || input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      { input, sessionToken: sessionTokenRef.current, language: "fr" },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.map(p => ({ description: p.description, placeId: p.place_id })));
          setShowSuggestions(true); // ✅ Afficher les suggestions
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
        setLoading(false);
      }
    );
  }, []);

  // Debounce input
  const fetchSuggestionsDebounced = useCallback((input: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchSuggestions(input), 300);
  }, [fetchSuggestions]);

  useEffect(() => {
    if (inputValue) {
      fetchSuggestionsDebounced(inputValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, fetchSuggestionsDebounced]);

  // ✅ Handle suggestion selection avec fermeture immédiate
  const handleSelect = (prediction: AutocompletePrediction) => {
    if (!window.google || !window.google.maps?.places) return;

    // ✅ Fermer immédiatement les suggestions
    setShowSuggestions(false);
    setSuggestions([]);

    const service = new window.google.maps.places.PlacesService(document.createElement("div"));
    service.getDetails(
      { placeId: prediction.placeId, fields: ["formatted_address", "geometry"] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          setValue(name, place.formatted_address || "", { shouldValidate: true });
          if (place.geometry?.location) {
            setValue("localisation_lat", place.geometry.location.lat(), { shouldValidate: true });
            setValue("localisation_lng", place.geometry.location.lng(), { shouldValidate: true });
          }
          // ✅ Nouveau token pour la prochaine recherche
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        }
      }
    );
  };

  // ✅ Clear input
  const handleClear = () => {
    setValue(name, "", { shouldValidate: true });
    setValue("localisation_lat", "", { shouldValidate: true });
    setValue("localisation_lng", "", { shouldValidate: true });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const { onChange, ...registerProps } = register(name);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* ✅ Input sans wrapper (comme Input et Select enhanced) */}
      <div className="relative flex items-center">
        <input
          {...registerProps}
          {...rest}
          type="text"
          value={inputValue || ""}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full px-4 py-3 pr-20 border-2 border-secondary/30 rounded-lg bg-white text-primary placeholder:text-secondary/50 transition-all duration-200 hover:border-secondary/50 focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-0"
          onChange={(e) => {
            onChange(e);
            setValue(name, e.target.value);
          }}
          onFocus={() => {
            // ✅ Réafficher les suggestions au focus si elles existent
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            // ✅ Fermer avec un délai pour permettre au clic de se produire
            setTimeout(() => setShowSuggestions(false), 200);
          }}
        />
        {loading ? (
          <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 animate-spin text-accent" size={18} />
        ) : inputValue ? (
          <button 
            type="button" 
            onMouseDown={(e) => {
              e.preventDefault(); // Empêche le blur de l'input
              e.stopPropagation(); // Empêche la propagation vers le formulaire
              handleClear();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-accent transition-colors p-1"
            aria-label="Effacer"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      {/* ✅ Suggestions avec onMouseDown pour éviter les problèmes de timing */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-[9999] bg-white border border-gray-200 w-full mt-1 top-full rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              className="p-3 hover:bg-accent/10 cursor-pointer border-b last:border-b-0 text-sm text-primary transition-colors"
              onMouseDown={(e) => {
                e.preventDefault(); // Empêche le blur de l'input
                e.stopPropagation(); // Empêche la propagation vers le formulaire
                handleSelect(s);
              }}
            >
              <div className="flex items-start gap-2">
                <span className="text-accent mt-0.5">📍</span>
                <span>{s.description}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}