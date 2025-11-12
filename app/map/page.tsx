'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Circle, GoogleMap, InfoWindow, Marker, useLoadScript } from "@react-google-maps/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Rooftop = {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  area_m2: number;
  estimated_panels: number;
  annual_generation_mwh: number;
  roof_type: string;
  sun_hours_per_day: number;
  contact_ready: boolean;
  notes: string;
};

type CityCluster = {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radiusKm: number;
};

const JAPAN_CENTER = { lat: 36.2048, lng: 138.2529 };
const ZOOM_LEVEL = 6;

const CITY_CLUSTERS: CityCluster[] = [
  {
    id: "sapporo",
    name: "Sapporo / Hokkaido",
    center: { lat: 43.0642, lng: 141.3469 },
    radiusKm: 120,
  },
  {
    id: "sendai",
    name: "Tohoku (Sendai & Miyagi)",
    center: { lat: 38.2682, lng: 140.8694 },
    radiusKm: 90,
  },
  {
    id: "niigata",
    name: "Sea of Japan (Niigata & Hokuriku)",
    center: { lat: 37.9162, lng: 139.0368 },
    radiusKm: 110,
  },
  {
    id: "kanto",
    name: "Greater Tokyo & Kanto",
    center: { lat: 35.6895, lng: 139.6917 },
    radiusKm: 110,
  },
  {
    id: "tokai",
    name: "Chubu & Tokai (Nagoya)",
    center: { lat: 35.1815, lng: 136.9066 },
    radiusKm: 90,
  },
  {
    id: "kansai",
    name: "Kansai (Kyoto, Osaka, Kobe)",
    center: { lat: 34.6937, lng: 135.5023 },
    radiusKm: 90,
  },
  {
    id: "hiroshima",
    name: "Chugoku (Hiroshima)",
    center: { lat: 34.3853, lng: 132.4553 },
    radiusKm: 80,
  },
  {
    id: "shikoku",
    name: "Shikoku (Takamatsu & Matsuyama)",
    center: { lat: 33.8416, lng: 133.5500 },
    radiusKm: 80,
  },
  {
    id: "kyushu",
    name: "Kyushu (Fukuoka, Kumamoto)",
    center: { lat: 33.5902, lng: 130.4017 },
    radiusKm: 120,
  },
  {
    id: "okinawa",
    name: "Okinawa & Islands",
    center: { lat: 26.2124, lng: 127.6809 },
    radiusKm: 80,
  },
];

const EARTH_RADIUS_KM = 6371;

function distanceKm(
  pointA: { lat: number; lng: number },
  pointB: { lat: number; lng: number }
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(pointB.lat - pointA.lat);
  const dLng = toRad(pointB.lng - pointA.lng);
  const lat1 = toRad(pointA.lat);
  const lat2 = toRad(pointB.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function classifyRooftop(rooftop: Rooftop): "high" | "medium" | "low" {
  if (rooftop.sun_hours_per_day >= 4.6 && rooftop.contact_ready) {
    return "high";
  }
  if (rooftop.sun_hours_per_day < 4.2 && !rooftop.contact_ready) {
    return "low";
  }
  return "medium";
}

const rooftopIconByClass: Record<"high" | "medium" | "low", string> = {
  high: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  medium: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  low: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
};

export default function MapPage() {
  const [rooftops, setRooftops] = useState<Rooftop[]>([]);
  const [selectedRooftop, setSelectedRooftop] = useState<Rooftop | null>(null);
  const [activeCityId, setActiveCityId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    const fetchRooftops = async () => {
      try {
        setStatus("loading");
        const response = await fetch("/api/rooftops");
        if (!response.ok) {
          throw new Error("Failed to load rooftops");
        }
        const data = (await response.json()) as Rooftop[];
        setRooftops(data);
        setStatus("idle");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    fetchRooftops();
  }, []);

  const containerStyle = useMemo(
    () => ({
      width: "100%",
      height: "100%",
    }),
    []
  );

  const citySummaries = useMemo(() => {
    return CITY_CLUSTERS.map((city) => {
      const rooftopsInCity = rooftops.filter(
        (rooftop) =>
          distanceKm(city.center, { lat: rooftop.latitude, lng: rooftop.longitude }) <= city.radiusKm
      );

      if (!rooftopsInCity.length) {
        return {
          city,
          rooftops: rooftopsInCity,
          metrics: {
            totalArea: 0,
            totalPanels: 0,
            avgSunHours: 0,
            contactReadyRatio: 0,
          },
          classification: "low" as "high" | "medium" | "low",
        };
      }

      const totalArea = rooftopsInCity.reduce((sum, rooftop) => sum + rooftop.area_m2, 0);
      const totalPanels = rooftopsInCity.reduce((sum, rooftop) => sum + rooftop.estimated_panels, 0);
      const avgSunHours =
        rooftopsInCity.reduce((sum, rooftop) => sum + rooftop.sun_hours_per_day, 0) /
        rooftopsInCity.length;
      const contactReadyRatio =
        rooftopsInCity.filter((rooftop) => rooftop.contact_ready).length / rooftopsInCity.length;

      let classification: "high" | "medium" | "low" = "medium";
      if (avgSunHours >= 4.6 && contactReadyRatio >= 0.45) {
        classification = "high";
      } else if (avgSunHours < 4.2 || contactReadyRatio < 0.25) {
        classification = "low";
      }

      return {
        city,
        rooftops: rooftopsInCity,
        metrics: {
          totalArea,
          totalPanels,
          avgSunHours,
          contactReadyRatio,
        },
        classification,
      };
    });
  }, [rooftops]);

  const activeCity = useMemo(
    () => citySummaries.find((summary) => summary.city.id === activeCityId),
    [citySummaries, activeCityId]
  );

  const classificationColors: Record<
    "high" | "medium" | "low",
    { fillColor: string; strokeColor: string; fillOpacity: number }
  > = {
    high: { fillColor: "#22c55e", strokeColor: "#15803d", fillOpacity: 0.18 },
    medium: { fillColor: "#facc15", strokeColor: "#eab308", fillOpacity: 0.16 },
    low: { fillColor: "#ef4444", strokeColor: "#dc2626", fillOpacity: 0.16 },
  };

  const handleCircleClick = useCallback(
    (cityId: string) => {
      const summary = citySummaries.find((item) => item.city.id === cityId);
      if (!summary) return;
      setActiveCityId(summary.city.id);
      setSelectedRooftop(null);
      if (mapRef.current) {
        mapRef.current.panTo(summary.city.center);
        const targetZoom =
          summary.city.radiusKm >= 110 ? 8 : summary.city.radiusKm >= 90 ? 9 : 10;
        mapRef.current.setZoom(targetZoom);
      }
    },
    [citySummaries]
  );

  const handleResetView = useCallback(() => {
    setActiveCityId(null);
    setSelectedRooftop(null);
    if (mapRef.current) {
      mapRef.current.panTo(JAPAN_CENTER);
      mapRef.current.setZoom(ZOOM_LEVEL);
    }
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-amber-50 text-emerald-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 pb-16 pt-16 sm:px-8 lg:px-12">
        <header className="space-y-4">
          <span className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime-700">
            Rooftop map
          </span>
          <h1 className="text-3xl font-semibold text-emerald-950 sm:text-4xl">
            Japan solar rooftop index
          </h1>
          <p className="max-w-3xl text-base text-emerald-700 sm:text-lg">
            Begin with a nationwide view, then zoom into Tokyo and nearby prefectures to inspect rooftop
            exposure, system sizing, and contact-readiness. Click an energy cell to zoom in, then open rooftop
            markers inside for site-specific insights.
          </p>
          <p className="text-sm text-emerald-600">
            Green cells mark high potential, yellow indicate balanced opportunity, and red highlight constrained
            corridors.
          </p>
        </header>

        <section className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          {loadError && (
            <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              Unable to load Google Maps. Check your API key configuration.
            </p>
          )}

          {!isLoaded && !loadError && (
            <div className="flex h-[480px] items-center justify-center rounded-2xl border border-dashed border-emerald-100 bg-emerald-50 text-sm text-emerald-700">
              Loading map…
            </div>
          )}

          {isLoaded && (
            <div className="h-[520px] w-full overflow-hidden rounded-2xl">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={JAPAN_CENTER}
                zoom={ZOOM_LEVEL}
                options={{
                  disableDefaultUI: false,
                  styles: undefined,
                }}
                onLoad={handleMapLoad}
                onUnmount={handleMapUnmount}
              >
                {citySummaries.map((summary) => {
                  if (!summary.rooftops.length) return null;
                  const { city, classification, metrics } = summary;
                  const { fillColor, strokeColor, fillOpacity } = classificationColors[classification];
                  const radius =
                    city.radiusKm * 1000 +
                    Math.min(
                      40000,
                      Math.sqrt(Math.max(metrics.totalArea, 1)) * 18 + summary.rooftops.length * 1200
                    );
                  return (
                    <Circle
                      key={city.id}
                      center={city.center}
                      radius={radius}
                      options={{
                        fillColor,
                        strokeColor,
                        fillOpacity,
                        strokeOpacity: 0.6,
                        strokeWeight: activeCityId === city.id ? 2 : 1,
                        clickable: true,
                        zIndex: activeCityId === city.id ? 30 : 10,
                      }}
                      onClick={() => handleCircleClick(city.id)}
                    />
                  );
                })}

                {activeCity &&
                  activeCity.rooftops.map((rooftop) => {
                    const quality = classifyRooftop(rooftop);
                    return (
                      <Marker
                        key={rooftop.id}
                        position={{ lat: rooftop.latitude, lng: rooftop.longitude }}
                        onClick={() => setSelectedRooftop(rooftop)}
                        icon={{ url: rooftopIconByClass[quality] }}
                      />
                    );
                  })}

                {selectedRooftop && (
                  <InfoWindow
                    position={{
                      lat: selectedRooftop.latitude,
                      lng: selectedRooftop.longitude,
                    }}
                    onCloseClick={() => setSelectedRooftop(null)}
                  >
                    <div className="space-y-2 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">{selectedRooftop.address}</p>
                      <p>
                        <span className="font-medium">Roof type:</span> {selectedRooftop.roof_type}
                      </p>
                      <p>
                        <span className="font-medium">Available area:</span> {selectedRooftop.area_m2} m²
                      </p>
                      <p>
                        <span className="font-medium">Estimated panel count:</span>{" "}
                        {selectedRooftop.estimated_panels.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Annual generation:</span>{" "}
                        {selectedRooftop.annual_generation_mwh.toFixed(0)} MWh
                      </p>
                      <p>
                        <span className="font-medium">Avg. sun hours:</span>{" "}
                        {selectedRooftop.sun_hours_per_day.toFixed(1)} h/day
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium">Contact ready:</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            selectedRooftop.contact_ready
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {selectedRooftop.contact_ready ? "Yes" : "No"}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">{selectedRooftop.notes}</p>
                    </div>
                  </InfoWindow>
                )}

                {activeCity && !selectedRooftop && (
                  <InfoWindow position={activeCity.city.center} onCloseClick={handleResetView}>
                    <div className="space-y-2 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">
                        {activeCity.city.name} ({activeCity.rooftops.length} rooftops)
                      </p>
                      <p>
                        <span className="font-medium">Total usable area:</span>{" "}
                        {Math.round(activeCity.metrics.totalArea).toLocaleString()} m²
                      </p>
                      <p>
                        <span className="font-medium">Estimated panels:</span>{" "}
                        {Math.round(activeCity.metrics.totalPanels).toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Avg. sun hours:</span>{" "}
                        {activeCity.metrics.avgSunHours.toFixed(2)} h/day
                      </p>
                      <p>
                        <span className="font-medium">Zone classification:</span>{" "}
                        {activeCity.classification === "high"
                          ? "High potential"
                          : activeCity.classification === "medium"
                          ? "Balanced opportunity"
                          : "Constrained / congested"}
                      </p>
                      <p>
                        <span className="font-medium">Contact-ready share:</span>{" "}
                        {(activeCity.metrics.contactReadyRatio * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-slate-500">
                        Click a rooftop marker within this zone to review individual site details or close to reset the national view.
                      </p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </div>
          )}

          {isLoaded && (
            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-700">
              <span className="font-medium uppercase tracking-wide text-emerald-800">Legend</span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                High potential zone
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                Balanced opportunity
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                Constrained / congested
              </span>
              <span className="text-emerald-600">
                Pins adopt the same color scale to show individual rooftop quality.
              </span>
            </div>
          )}

          {status === "loading" && (
            <p className="text-sm text-emerald-700">Fetching latest rooftop data…</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">
              We couldn&apos;t load rooftop data right now. Please refresh to try again.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

