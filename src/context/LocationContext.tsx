'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { apiClient } from "@/lib/api-client";

export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  display_name: string;
  village?: string;
  town?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

interface LocationContextType {
  location: ResolvedLocation | null;
  activeSearch: string;
  loading: boolean;
  error: string | null;
  setLocation: (loc: ResolvedLocation | null) => void;
  setActiveSearch: (search: string) => void;
  resolveLocation: (query?: string, lat?: number, lon?: number) => Promise<ResolvedLocation[]>;
  requestGPS: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<ResolvedLocation | null>(null);
  const [activeSearch, setActiveSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const searchAbortController = useRef<AbortController | null>(null);

  // Initialize safely from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nyaya_location");
      if (stored) {
        setLocationState(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load location from storage", e);
    }
  }, []);

  const setLocation = useCallback((loc: ResolvedLocation | null) => {
    setLocationState(loc);
    try {
      if (loc) {
        localStorage.setItem("nyaya_location", JSON.stringify(loc));
      } else {
        localStorage.removeItem("nyaya_location");
      }
    } catch (e) {
      console.warn("Failed to save location", e);
    }
    setActiveSearch("");
  }, []);

  const resolveLocation = useCallback(async (query?: string, lat?: number, lon?: number): Promise<ResolvedLocation[]> => {
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
    const controller = new AbortController();
    searchAbortController.current = controller;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<ResolvedLocation[]>("/discovery/resolve-location", {
        query,
        lat,
        lon
      }, {
        signal: controller.signal
      });
      return data || [];
    } catch (err: any) {
      if (err.name === "AbortError") {
        return [];
      }
      setError(err.message || "Failed to resolve location");
      return [];
    } finally {
      if (searchAbortController.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  const requestGPS = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const matches = await resolveLocation(undefined, latitude, longitude);
        if (matches && matches.length > 0) {
          setLocation(matches[0]);
        } else {
          setLocation({
            latitude,
            longitude,
            display_name: "Current GPS Location",
            village: "",
            town: "",
            city: "",
            district: "",
            state: "",
            pincode: ""
          });
        }
      },
      (err) => {
        setError("Failed to retrieve GPS location. Please check browser permissions.");
        setLoading(false);
      },
      {
        timeout: 10000,
        maximumAge: 60000,
        enableHighAccuracy: true
      }
    );
  }, [setLocation, resolveLocation]);

  const value = useMemo(() => ({
    location,
    activeSearch,
    loading,
    error,
    setLocation,
    setActiveSearch,
    resolveLocation,
    requestGPS
  }), [location, activeSearch, loading, error, setLocation, resolveLocation, requestGPS]);

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
