"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchCities, type City } from "@/lib/cities";

interface CityAutocompleteProps {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  selectedCity: City | null;
  onValueChange: (value: string) => void;
  onSelect: (city: City) => void;
}

export function CityAutocomplete({
  label,
  value,
  placeholder,
  required,
  selectedCity,
  onValueChange,
  onSelect,
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipSearchRef = useRef(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const query = value.trim();

    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    if (selectedCity && selectedCity.label === value) {
      setSuggestions([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();

    debounceRef.current = window.setTimeout(async () => {
      try {
        const results = await searchCities(query, controller.signal);
        setSuggestions(results);
        setActiveIndex(-1);
        setIsOpen(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [value, selectedCity]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: City) => {
    skipSearchRef.current = true;
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect(city);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      handleSelect(suggestions[activeIndex >= 0 ? activeIndex : 0]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-1.5">
      <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label} {required ? "*" : ""}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        </div>
        <input
          type="text"
          value={value}
          placeholder={placeholder ?? `Digite ${label.toLowerCase()}`}
          required={required}
          autoComplete="off"
          onChange={(event) => onValueChange(event.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950/60 py-2 pl-11 pr-4 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-500 focus-visible:ring-1 focus-visible:ring-white/20"
        />
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl shadow-black/60">
            {suggestions.length > 0 ? (
              suggestions.map((city, index) => (
                <button
                  key={city.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(city)}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors",
                    index === activeIndex
                      ? "bg-white/10 text-white"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-zinc-500" />
                  <span className="truncate font-medium">{city.name}</span>
                  {city.state && <span className="shrink-0 text-xs text-zinc-500">{city.state}</span>}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-xs text-zinc-500">
                {isSearching ? "Buscando cidades..." : "Nenhuma cidade encontrada."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
