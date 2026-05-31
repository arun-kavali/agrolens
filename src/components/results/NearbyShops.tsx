import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Navigation, Phone, Clock, Store,
  ChevronDown, Loader2, AlertCircle, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/languages";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for leaflet in bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Shop {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distance: number;
  address?: string;
  phone?: string;
  openNow?: boolean;
  tags?: Record<string, string>;
}

interface NearbyShopsProps {
  lang: string;
  medicines?: { name: string }[];
}

const userIcon = L.divIcon({
  html: `<div style="background:#22c55e;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const shopIcon = L.divIcon({
  html: `<div style="background:hsl(var(--primary));width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.3)"></div>`,
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const NearbyShops = ({ lang, medicines = [] }: NearbyShopsProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5000);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Request geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setShowManual(true);
      setError(t(lang, "locationRequired"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setShowManual(true);
        setError(t(lang, "locationRequired"));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [lang]);

  // Search by manual city name using Nominatim
  const handleManualSearch = async () => {
    if (!manualInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualInput)}&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        setUserLocation({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        setShowManual(false);
      } else {
        setError(t(lang, "noShopsFound"));
      }
    } catch {
      setError(t(lang, "locationRequired"));
    } finally {
      setLoading(false);
    }
  };

  const RADII = [5000, 10000, 25000, 50000];

  // Search nearby shops using Overpass API with progressive radius
  const searchShops = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    setShops([]);

    for (const radius of RADII) {
      setSearchRadius(radius);
      const query = `
      [out:json][timeout:15];
      (
        node["shop"="agrarian"](around:${radius},${lat},${lon});
        node["shop"="farm"](around:${radius},${lat},${lon});
        node["shop"="garden_centre"](around:${radius},${lat},${lon});
        node["shop"="doityourself"]["name"~"agri|farm|seed|fertil|pesti",i](around:${radius},${lat},${lon});
        node["amenity"="marketplace"](around:${radius},${lat},${lon});
        node["shop"="chemist"]["name"~"agri|farm|seed|fertil|pesti|agro",i](around:${radius},${lat},${lon});
        node["name"~"agri|agriculture|fertilizer|pesticide|seed|agro|krishi|kisan",i](around:${radius},${lat},${lon});
      );
      out body;
    `;
      try {
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: `data=${encodeURIComponent(query)}`,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        const data = await res.json();
        const found: Shop[] = (data.elements || [])
          .filter((el: any) => el.tags?.name)
          .map((el: any) => ({
            id: el.id,
            name: el.tags.name,
            lat: el.lat,
            lon: el.lon,
            distance: haversineDistance(lat, lon, el.lat, el.lon),
            address: [el.tags["addr:street"], el.tags["addr:city"], el.tags["addr:state"]].filter(Boolean).join(", "),
            phone: el.tags.phone || el.tags["contact:phone"],
            openNow: undefined,
            tags: el.tags,
          }))
          .sort((a: Shop, b: Shop) => a.distance - b.distance)
          .slice(0, 10);

        if (found.length >= 3 || radius === RADII[RADII.length - 1]) {
          setShops(found);
          if (found.length === 0) {
            setError(t(lang, "noShopsFound"));
          }
          setLoading(false);
          return;
        }
        if (found.length > 0 && radius >= 25000) {
          setShops(found);
          setLoading(false);
          return;
        }
      } catch {
        // continue to next radius
      }
    }

    setError(t(lang, "noShopsFound"));
    setLoading(false);
  }, [lang]);

  useEffect(() => {
    if (userLocation) {
      searchShops(userLocation.lat, userLocation.lon);
    }
  }, [userLocation, searchShops]);

  // Initialize / update map
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapRef.current).setView([userLocation.lat, userLocation.lon], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
      .addTo(map)
      .bindPopup(t(lang, "yourLocation"));

    shops.forEach((shop) => {
      L.marker([shop.lat, shop.lon], { icon: shopIcon })
        .addTo(map)
        .bindPopup(`<b>${shop.name}</b><br/>${shop.distance.toFixed(1)} km`);
    });

    if (shops.length > 0) {
      const bounds = L.latLngBounds(
        [userLocation, ...shops].map((p) => [p.lat, p.lon] as [number, number])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [userLocation, shops, lang]);

  const openDirections = (shop: Shop) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lon}&destination=${shop.lat},${shop.lon}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="w-5 h-5 text-primary" />
            {t(lang, "nearbyShops")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t(lang, "nearbyShopsDesc")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Manual location input */}
          {showManual && (
            <div className="flex gap-2">
              <Input
                placeholder={t(lang, "enterLocation")}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
              />
              <Button onClick={handleManualSearch} disabled={loading} size="sm">
                <Search className="w-4 h-4 mr-1" />
                {t(lang, "searchShops")}
              </Button>
            </div>
          )}

          {/* Error */}
          {error && !loading && shops.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-accent">
              <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">{t(lang, "searchingShops")}</span>
              <span className="text-xs text-muted-foreground/70">
                {searchRadius > 5000 && `Expanding search to ${searchRadius / 1000} km...`}
              </span>
            </div>
          )}

          {/* Map */}
          {userLocation && (
            <div
              ref={mapRef}
              className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden border border-border z-0"
            />
          )}

          {/* Shop cards */}
          {shops.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shops.map((shop, i) => (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="flex items-start gap-3 mb-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-card-foreground text-sm truncate">{shop.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{shop.distance.toFixed(1)} km {t(lang, "away")}</span>
                        </div>
                        {shop.address && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{shop.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 text-xs gap-1"
                        onClick={() => openDirections(shop)}
                      >
                        <Navigation className="w-3 h-3" />
                        {t(lang, "getDirections")}
                      </Button>
                      {shop.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1"
                          onClick={() => window.open(`tel:${shop.phone}`, "_self")}
                        >
                          <Phone className="w-3 h-3" />
                          {t(lang, "callShop")}
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Retry button */}
          {!loading && shops.length === 0 && userLocation && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => searchShops(userLocation.lat, userLocation.lon)}
              >
                <Search className="w-4 h-4" />
                {t(lang, "searchLargerArea")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NearbyShops;
