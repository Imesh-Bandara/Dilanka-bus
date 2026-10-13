"use client";
import { useTranslation } from "./locale";
import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Route as RouteIcon,
  Maximize2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import type { Map as LeafletMap, CircleMarker } from "leaflet";
import type { Route } from "@/lib/types";
import { time } from "@/lib/types";
import { journeyGeometry } from "@/lib/journey-map";

export function JourneyMap({
  route,
  departure,
  pickup,
  dropoff,
}: {
  route: Route;
  departure?: string;
  pickup?: string;
  dropoff?: string;
}) {
  const tr = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <details
      className="journey-details"
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        <span>
          <RouteIcon size={17} /> {tr(" Explore route & stops ")}
        </span>
        <span className="map-summary-via">{tr(route.via)}</span>
        <ChevronDown size={17} />
      </summary>
      {open && (
        <MapContent
          route={route}
          departure={departure}
          pickup={pickup}
          dropoff={dropoff}
        />
      )}
    </details>
  );
}
function MapContent({
  route,
  departure,
  pickup,
  dropoff,
}: {
  route: Route;
  departure?: string;
  pickup?: string;
  dropoff?: string;
}) {
  const tr = useTranslation();
  const host = useRef<HTMLDivElement>(null),
    map = useRef<LeafletMap | null>(null);
  const markers = useRef<CircleMarker[]>([]);
  const [selected, setSelected] = useState(pickup || route.origin),
    [error, setError] = useState("");
  const geometry = journeyGeometry(route);
  useEffect(() => {
    let disposed = false;
    import("leaflet")
      .then((L) => {
        if (disposed || !host.current) return;
        const m = L.map(host.current, {
          scrollWheelZoom: false,
          zoomControl: false,
        });
        map.current = m;
        L.control
          .zoom({ zoomInTitle: tr("Zoom in"), zoomOutTitle: tr("Zoom out") })
          .addTo(m);
        const layer = L.tileLayer(
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
            referrerPolicy: "strict-origin-when-cross-origin",
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> ' +
              tr("contributors"),
          },
        ).addTo(m);
        layer.on("tileerror", () => {
          if (!disposed)
            setError(
              "The background map could not load. Stops and the corridor are still shown below.",
            );
        });
        L.polyline(geometry.points, {
          color: "#314b3e",
          weight: 5,
          opacity: 0.85,
          dashArray: "8 7",
        }).addTo(m);
        if (geometry.highway.length)
          L.polyline(geometry.highway, {
            color: "#c29d47",
            weight: 6,
            opacity: 1,
            dashArray: "8 7",
          }).addTo(m);
        markers.current = geometry.stops
          .filter((s) => s.coordinate)
          .map((s) => {
            const endpoint = s.name === pickup || s.name === dropoff;
            const marker = L.circleMarker(s.coordinate, {
              radius: endpoint ? 9 : 6,
              color: "#fff",
              weight: 3,
              fillColor: endpoint ? "#b08a34" : "#314b3e",
              fillOpacity: 1,
            }).addTo(m);
            // Text nodes prevent route names from becoming untrusted popup HTML.
            const label = document.createElement("span");
            label.textContent = tr(s.name);
            marker
              .bindTooltip(label, { direction: "top" })
              .on("click", () => setSelected(s.name));
            return marker;
          });
        if (geometry.points.length > 1)
          m.fitBounds(L.latLngBounds(geometry.points), { padding: [35, 35] });
        else m.setView([7.2, 80.7], 7);
        requestAnimationFrame(() => m.invalidateSize());
      })
      .catch(() =>
        setError(
          "Map unavailable. Use the stop list and location links below.",
        ),
      );
    return () => {
      disposed = true;
      map.current?.remove();
      map.current = null;
      markers.current = [];
    };
    // This panel remounts for each route and opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.id, pickup, dropoff, tr]);
  const start = route.stops.findIndex(
    (s) => s.name === (pickup || route.origin),
  );
  const end = route.stops.findIndex(
    (s) => s.name === (dropoff || route.destination),
  );
  const focus = (name: string) => {
    setSelected(name);
    const stop = geometry.stops.find((s) => s.name === name);
    if (stop?.coordinate)
      map.current?.setView(stop.coordinate, 11, { animate: true });
  };
  return (
    <div className="journey-map-content">
      <div className="journey-map-canvas">
        <div
          ref={host}
          className="leaflet-host"
          role="region"
          aria-label={tr(
            `${route.origin} to ${route.destination} approximate route map`,
          )}
        />
        <button
          className="map-fit"
          type="button"
          onClick={() => {
            if (geometry.points.length > 1)
              map.current?.fitBounds(geometry.points, { padding: [35, 35] });
          }}
        >
          <Maximize2 size={15} /> {tr(" Show full route ")}
        </button>
        <div className="map-legend">
          <span>
            <i /> {tr(" Corridor ")}
          </span>
          {!!geometry.highway.length && (
            <span>
              <i className="highway" /> {tr(" E01 highway ")}
            </span>
          )}
        </div>
      </div>
      <div className="map-stop-panel">
        <div className="map-stop-heading">
          <span className="eyebrow">{tr("YOUR ROAD AHEAD")}</span>
          <h3>
            {tr(route.origin)} → {tr(route.destination)}
          </h3>
          <p>
            {tr(
              geometry.highway.length
                ? "Via Southern Expressway · E01"
                : "Main-road corridor",
            )}
          </p>
        </div>
        <ol className="map-stop-list">
          {geometry.stops.map((s, i) => (
            <li
              key={s.name}
              className={`${s.name === selected ? "active" : ""} ${i >= start && i <= end ? "in-journey" : ""}`}
            >
              <button
                type="button"
                onClick={() => focus(s.name)}
                aria-pressed={s.name === selected}
              >
                <span className="stop-dot" />
                <span>
                  <strong>{tr(s.name)}</strong>
                  <small>
                    {tr(
                      s.name === pickup
                        ? "Your boarding stop"
                        : s.name === dropoff
                          ? "Your drop-off stop"
                          : i === 0
                            ? "Journey starts"
                            : i === geometry.stops.length - 1
                              ? "Journey ends"
                              : "Intermediate stop",
                    )}
                  </small>
                </span>
                <time>
                  {tr(
                    departure
                      ? time(
                          new Date(
                            new Date(departure).getTime() + s.offset * 60000,
                          ).toISOString(),
                        )
                      : `${Math.floor(s.offset / 60)}h ${s.offset % 60}m`,
                  )}
                </time>
              </button>
              {s.name === selected && (
                <div className="selected-stop">
                  <p>
                    <MapPin size={13} />
                    {tr(s.location)}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + " bus stand Sri Lanka")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tr(" Find this town on Maps ")}
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
      <p className="map-disclaimer">
        {error && <span role="status">{tr(error)} </span>}
        {tr(
          "Illustrative corridor, town-centre markers and sample times. Lines are not turn-by-turn directions. Exact boarding points and highway entry/exit require operator confirmation. Highway interchanges are not boarding stops. ",
        )}
      </p>
    </div>
  );
}
