import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

interface Prediction {
  description: string;
  placeId: string;
}

interface AddressSearchProps {
  onAnalyze: (address: string, lat: number, lng: number) => void;
  isLoading?: boolean;
}

export function AddressSearch({ onAnalyze, isLoading }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedLat, setSelectedLat] = useState(0);
  const [selectedLng, setSelectedLng] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trpcUtils = trpc.useUtils();

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setPredictions([]);
      return;
    }
    setIsFetching(true);
    try {
      const results = await trpcUtils.analysis.autocomplete.fetch({ input });
      setPredictions(results);
      setShowDropdown(true);
    } catch (e) {
      console.error("Autocomplete error:", e);
    } finally {
      setIsFetching(false);
    }
  }, [trpcUtils]);

  const geocodePlace = useCallback(async (placeId: string, description: string) => {
    try {
      const result = await trpcUtils.analysis.geocode.fetch({ placeId });
      if (result) {
        setSelectedAddress(result.address || description);
        setSelectedLat(result.lat);
        setSelectedLng(result.lng);
        setQuery(result.address || description);
        setShowDropdown(false);
        setPredictions([]);
      }
    } catch (e) {
      console.error("Geocode error:", e);
    }
  }, [trpcUtils]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query !== selectedAddress) {
        fetchPredictions(query);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedAddress, fetchPredictions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleAnalyze = () => {
    if (selectedAddress && selectedLat && selectedLng) {
      onAnalyze(selectedAddress, selectedLat, selectedLng);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value !== selectedAddress) {
                setSelectedAddress("");
                setSelectedLat(0);
                setSelectedLng(0);
              }
            }}
            onFocus={() => {
              if (predictions.length > 0) setShowDropdown(true);
            }}
            placeholder="Enter a restaurant address or location..."
            className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-border bg-white text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base shadow-sm"
          />
          {isFetching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={!selectedAddress || isLoading}
          className="h-14 px-8 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Analyze My Location
            </>
          )}
        </Button>
      </div>

      {/* Autocomplete dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border shadow-xl z-50 overflow-hidden">
          {predictions.map((p) => (
            <button
              key={p.placeId}
              onClick={() => geocodePlace(p.placeId, p.description)}
              className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-start gap-3 border-b border-border/50 last:border-0"
            >
              <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span className="text-sm text-foreground">{p.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
