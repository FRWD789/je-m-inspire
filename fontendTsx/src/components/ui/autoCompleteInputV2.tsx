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
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      return;
    }

    setLoading(true);
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      { input, sessionToken: sessionTokenRef.current, language: "fr" },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.map(p => ({ description: p.description, placeId: p.place_id })));
        } else {
          setSuggestions([]);
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
    if (inputValue) fetchSuggestionsDebounced(inputValue);
    else setSuggestions([]);
  }, [inputValue, fetchSuggestionsDebounced]);

  // Handle suggestion selection
  const handleSelect = (prediction: AutocompletePrediction) => {
    if (!window.google || !window.google.maps?.places) return;

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
          setSuggestions([]);
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        }
      }
    );
  };

  // Clear input
  const handleClear = () => {
    setValue(name, "", { shouldValidate: true });
    setValue("localisation_lat", "", { shouldValidate: true });
    setValue("localisation_lng", "", { shouldValidate: true });
    setSuggestions([]);
  };

  const { onChange, ...registerProps } = register(name);

  return (
    <div className="relative flex flex-col">
      <div className="relative flex items-center border rounded px-2 py-1 focus-within:ring-2 focus-within:ring-blue-400">
        <input
          {...registerProps}
          {...rest}
          type="text"
          value={inputValue || ""}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full outline-none"
          onChange={(e) => {
            onChange(e);
            setValue(name, e.target.value);
          }}
        />
        {loading ? (
          <Loader2 className="animate-spin text-gray-400 ml-2" size={18} />
        ) : inputValue ? (
          <button type="button" onClick={handleClear} className="ml-2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        ) : null}
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute z-[9999] bg-white border w-full mt-1 top-full rounded shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSelect(s)}
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
