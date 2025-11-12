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

const JAPAN_CENTER = { lat: 36.2048, lng: 138.2529 };
const ZOOM_LEVEL = 6;
const CELL_SIZE = 0.8;

export default function MapPage() {
  const [rooftops, setRooftops] = useState<Rooftop[]>([]);
  const [selectedRooftop, setSelectedRooftop] = useState<Rooftop | null>(null);
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
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

  const gridCells = useMemo(() => {
    const cells = new Map<string, {
      id: string;
      latBucket: number;
      lngBucket: number;
      rooftops: Rooftop[];
    }>();

    rooftops.forEach((rooftop) => {
      const latBucket = Math.floor(rooftop.latitude / CELL_SIZE);
      const lngBucket = Math.floor(rooftop.longitude / CELL_SIZE);
      const key = `${latBucket}:${lngBucket}`;

      if (!cells.has(key)) {
        cells.set(key, { id: key, latBucket, lngBucket, rooftops: [] });
      }

      cells.get(key)!.rooftops.push(rooftop);
    });

    return Array.from(cells.values()).map((cell) => {
      const south = cell.latBucket * CELL_SIZE;
      const north = south + CELL_SIZE;
      const west = cell.lngBucket * CELL_SIZE;
      const east = west + CELL_SIZE;

      const totalArea = cell.rooftops.reduce((sum, rooftop) => sum + rooftop.area_m2, 0);
      const totalPanels = cell.rooftops.reduce((sum, rooftop) => sum + rooftop.estimated_panels, 0);
      const avgSunHours =
        cell.rooftops.reduce((sum, rooftop) => sum + rooftop.sun_hours_per_day, 0) /
        cell.rooftops.length;
      const contactReadyRatio =
        cell.rooftops.filter((rooftop) => rooftop.contact_ready).length / cell.rooftops.length;

      let classification: "high" | "medium" | "low" = "medium";
      if (avgSunHours >= 4.6 && contactReadyRatio >= 0.5) {
        classification = "high";
      } else if (avgSunHours < 4.3 || contactReadyRatio < 0.25) {
        classification = "low";
      }

      return {
        id: cell.id,
        bounds: { north, south, east, west },
        rooftops: cell.rooftops,
        centroid: {
          lat: (north + south) / 2,
          lng: (east + west) / 2,
        },
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

  const activeCell = useMemo(
    () => gridCells.find((cell) => cell.id === activeCellId),
    [gridCells, activeCellId]
  );

  const classificationColors: Record<
    "high" | "medium" | "low",
    { fillColor: string; strokeColor: string; fillOpacity: number }
  > = {
    high: { fillColor: "#22c55e", strokeColor: "#16a34a", fillOpacity: 0.25 },
    medium: { fillColor: "#facc15", strokeColor: "#eab308", fillOpacity: 0.2 },
    low: { fillColor: "#f87171", strokeColor: "#ef4444", fillOpacity: 0.2 },
  };

  const handleCircleClick = useCallback(
    (cellId: string) => {
      const cell = gridCells.find((item) => item.id === cellId);
      if (!cell) return;
      setActiveCellId(cell.id);
      setSelectedRooftop(null);
      if (mapRef.current) {
        mapRef.current.panTo(cell.centroid);
        mapRef.current.setZoom(9);
      }
    },
    [gridCells]
  );

  const handleResetView = useCallback(() => {
    setActiveCellId(null);
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
                {gridCells.map((cell) => {
                  const { fillColor, strokeColor, fillOpacity } = classificationColors[cell.classification];
                  const radius =
                    20000 +
                    Math.min(
                      40000,
                      Math.sqrt(Math.max(cell.metrics.totalArea, 1)) * 25 + cell.rooftops.length * 1500
                    );
                  return (
                    <Circle
                      key={cell.id}
                      center={cell.centroid}
                      radius={radius}
                      options={{
                        fillColor,
                        strokeColor,
                        fillOpacity,
                        strokeOpacity: 0.6,
                        strokeWeight: activeCellId === cell.id ? 2 : 1,
                        clickable: true,
                        zIndex: activeCellId === cell.id ? 30 : 10,
                      }}
                      onClick={() => handleCircleClick(cell.id)}
                    />
                  );
                })}

                {activeCell &&
                  activeCell.rooftops.map((rooftop) => (
                    <Marker
                      key={rooftop.id}
                      position={{ lat: rooftop.latitude, lng: rooftop.longitude }}
                      onClick={() => setSelectedRooftop(rooftop)}
                      icon={{
                        url: rooftop.contact_ready
                          ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                          : "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                      }}
                    />
                  ))}

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

                {activeCell && !selectedRooftop && (
                  <InfoWindow position={activeCell.centroid} onCloseClick={handleResetView}>
                    <div className="space-y-2 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">
                        Grid segment overview ({activeCell.rooftops.length} rooftops)
                      </p>
                      <p>
                        <span className="font-medium">Total usable area:</span>{" "}
                        {Math.round(activeCell.metrics.totalArea).toLocaleString()} m²
                      </p>
                      <p>
                        <span className="font-medium">Estimated panels:</span>{" "}
                        {Math.round(activeCell.metrics.totalPanels).toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Avg. sun hours:</span>{" "}
                        {activeCell.metrics.avgSunHours.toFixed(2)} h/day
                      </p>
                      <p>
                        <span className="font-medium">Contact-ready share:</span>{" "}
                        {(activeCell.metrics.contactReadyRatio * 100).toFixed(0)}%
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

