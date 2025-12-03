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
  const wrapperRef = useRef<HTMLDivElement>(null); // ✅ Pour détecter les clics en dehors

  // ✅ Fermer les suggestions si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div ref={wrapperRef} className="relative flex flex-col">
      {/* ✅ Wrapper sans border bleu, utilise les classes du projet */}
      <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2.5 transition-colors duration-200 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20 bg-white">
        <input
          {...registerProps}
          {...rest}
          type="text"
          value={inputValue || ""}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full outline-none bg-transparent text-primary placeholder:text-secondary"
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
        />
        {loading ? (
          <Loader2 className="animate-spin text-accent ml-2" size={18} />
        ) : inputValue ? (
          <button 
            type="button" 
            onClick={handleClear} 
            className="ml-2 text-secondary hover:text-primary transition-colors"
            aria-label="Effacer"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {/* ✅ Suggestions avec contrôle explicite de l'affichage */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-[9999] bg-white border border-gray-200 w-full mt-1 top-full rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              className="p-3 hover:bg-accent/10 cursor-pointer border-b last:border-b-0 text-sm text-primary transition-colors"
              onClick={() => handleSelect(s)}
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