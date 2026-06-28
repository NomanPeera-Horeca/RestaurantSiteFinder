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
  canAnalyze?: boolean;
  buttonLabel?: string;
  prefillAddress?: string;
  prefillRevision?: number;
}

function formatAddressLines(description: string): { primary: string; secondary: string } {
  const parts = description.split(",").map(p => p.trim());
  if (parts.length <= 1) {
    return { primary: description, secondary: "" };
  }
  return {
    primary: parts[0],
    secondary: parts.slice(1).join(", "),
  };
}

export function AddressSearch({ onAnalyze, isLoading, canAnalyze = true, buttonLabel = "Analyze My Location Now", prefillAddress, prefillRevision = 0 }: AddressSearchProps) {
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
      setShowDropdown(results.length > 0);
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
    if (!prefillAddress) return;
    let cancelled = false;

    const prefill = async () => {
      setQuery(prefillAddress);
      setSelectedAddress("");
      setSelectedLat(0);
      setSelectedLng(0);
      setPredictions([]);
      setShowDropdown(false);

      try {
        const results = await trpcUtils.analysis.autocomplete.fetch({ input: prefillAddress });
        if (cancelled || results.length === 0) return;
        const result = await trpcUtils.analysis.geocode.fetch({ placeId: results[0].placeId });
        if (cancelled || !result) return;
        setSelectedAddress(result.address || results[0].description);
        setSelectedLat(result.lat);
        setSelectedLng(result.lng);
        setQuery(result.address || results[0].description);
      } catch (e) {
        console.error("Prefill geocode error:", e);
      }
    };

    void prefill();
    return () => {
      cancelled = true;
    };
  }, [prefillAddress, prefillRevision, trpcUtils]);

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
    <div ref={wrapperRef} className="relative w-full space-y-3">
      <div className="relative z-30">
        <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
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
          placeholder="Street address, city, or ZIP code..."
          className="h-12 w-full rounded-xl border border-border/80 bg-white pl-12 pr-11 text-base text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown && predictions.length > 0}
        />
        {isFetching && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}

        {showDropdown && predictions.length > 0 && (
          <div
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-xl border border-border bg-white shadow-2xl ring-1 ring-black/5"
          >
            <div className="border-b border-border/60 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
              {predictions.length} address{predictions.length === 1 ? "" : "es"} found. Select one
            </div>
            {predictions.map((p) => {
              const { primary, secondary } = formatAddressLines(p.description);
              return (
                <button
                  key={p.placeId}
                  type="button"
                  role="option"
                  onClick={() => geocodePlace(p.placeId, p.description)}
                  className="flex w-full items-start gap-3 border-b border-border/40 px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-primary/5 focus:bg-primary/5 focus:outline-none"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug text-foreground">{primary}</span>
                    {secondary && (
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{secondary}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Button
        size="lg"
        onClick={handleAnalyze}
        disabled={!selectedAddress || isLoading || !canAnalyze}
        className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing your location...
          </>
        ) : (
          <>
            <Search className="mr-2 h-5 w-5" />
            {buttonLabel}
          </>
        )}
      </Button>
    </div>
  );
}
