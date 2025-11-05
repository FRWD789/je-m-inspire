import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Loader2, X } from "lucide-react";

type AutocompleteInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  placeholder?: string;
};
export default function AutocompleteInput({ name, placeholder = "Rechercher une adresse...", ...rest }: AutocompleteInputProps) {
  const { register, setValue, watch } = useFormContext();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputValue = watch(name);
  const sessionTokenRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Init session token
  useEffect(() => {
    const initToken = async () => {
      const { AutocompleteSessionToken } = await google.maps.importLibrary("places");
      sessionTokenRef.current = new AutocompleteSessionToken();
    };
    initToken();
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const { AutocompleteSuggestion } = await google.maps.importLibrary("places");
      const request = { input, sessionToken: sessionTokenRef.current, language: "fr", region: "fr" };
      const { suggestions: fetched } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      setSuggestions(fetched.map((s: any) => s.placePrediction));
    } catch (err) {
      console.error("Erreur suggestions:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestionsDebounced = useCallback((input: string) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchSuggestions(input), 300);
  }, []);

  useEffect(() => {
    if (inputValue) fetchSuggestionsDebounced(inputValue);
    else setSuggestions([]);
  }, [inputValue, fetchSuggestionsDebounced]);

  const handleSelect = async (prediction: any) => {
    try {
      const { Place } = await google.maps.importLibrary("places");
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ["location", "formattedAddress"] });

      setValue(name, place.formattedAddress, { shouldValidate: true });
      setValue("localisation_address", place.formattedAddress);
      if (place.location) {
        setValue("localisation_lat", place.location.lat());
        setValue("localisation_lng", place.location.lng());
      }
      setSuggestions([]);

      // New token for next autocomplete
      const { AutocompleteSessionToken } = await google.maps.importLibrary("places");
      sessionTokenRef.current = new AutocompleteSessionToken();
    } catch (err) {
      console.error("Erreur lors de la sélection:", err);
    }
  };

  const handleClear = () => {
    setValue(name, "", { shouldValidate: true });
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
              {s.text?.text || s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
