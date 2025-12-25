"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Campsite } from "@/lib/types/Campsite";

type Props = {
  campsites: Campsite[];
  height?: number | string;
  zoom?: number;
  selectedCampsiteId?: number | null;
};

export default function MyCampsitesMap({
  campsites,
  height = 320,
  zoom = 4,
  selectedCampsiteId,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    // Center on the first campsite or a default
    const initialCenter: [number, number] =
      campsites.length > 0
        ? [campsites[0].lng, campsites[0].lat]
        : [-98.5795, 39.8283];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: initialCenter,
      zoom,
      interactive: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add markers for each campsite
    campsites.forEach((campsite) => {
      if (
        typeof campsite.lat === "number" &&
        typeof campsite.lng === "number"
      ) {
        const formatDate = (dateStr?: string | null) => {
          if (!dateStr) return "";
          const date = new Date(dateStr + "T00:00:00");
          return date.toLocaleDateString();
        };

        const stars = campsite.rating
          ? "⭐".repeat(campsite.rating)
          : "No rating";

        const popupHTML = `
          <div style="min-width: 200px; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${
              campsite.name
            }</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #666;">
              📍 ${campsite.city ? campsite.city + ", " : ""}${
          campsite.state ?? ""
        }, ${campsite.country ?? ""}
            </p>
            ${
              campsite.rating
                ? `<p style="margin: 4px 0; font-size: 13px;">${stars} ${campsite.rating}/5</p>`
                : ""
            }
            ${
              campsite.date_visited
                ? `<p style="margin: 4px 0; font-size: 13px; color: #666;">📅 Visited: ${formatDate(
                    campsite.date_visited
                  )}</p>`
                : ""
            }
            ${
              campsite.description
                ? `<p style="margin: 8px 0 0 0; font-size: 13px; line-height: 1.4;">${campsite.description.slice(
                    0,
                    100
                  )}${campsite.description.length > 100 ? "..." : ""}</p>`
                : ""
            }
            <a href="/my-campsites/${
              campsite.id
            }" style="display: inline-block; margin-top: 8px; color: #0066cc; text-decoration: none; font-size: 13px; font-weight: 500;">View Details →</a>
          </div>
        `;

        new mapboxgl.Marker()
          .setLngLat([campsite.lng, campsite.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 12, maxWidth: "320px" }).setHTML(
              popupHTML
            )
          )
          .addTo(map);
      }
    });

    // Fit bounds to all markers if more than one
    if (campsites.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      campsites.forEach((campsite) => {
        if (
          typeof campsite.lat === "number" &&
          typeof campsite.lng === "number"
        ) {
          bounds.extend([campsite.lng, campsite.lat]);
        }
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 10 });
      }
    }

    mapRef.current = map;

    // Resize fix
    const t = setTimeout(() => map.resize(), 0);

    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
    };
  }, [campsites, zoom]);

  // Center map on selected campsite when "Locate" is used
  useEffect(() => {
    if (!mapRef.current || !selectedCampsiteId) return;

    const campsite = campsites.find((c) => c.id === selectedCampsiteId);
    if (
      campsite &&
      typeof campsite.lat === "number" &&
      typeof campsite.lng === "number"
    ) {
      mapRef.current.flyTo({
        center: [campsite.lng, campsite.lat],
        zoom: 12,
        duration: 1500,
      });
    }
  }, [selectedCampsiteId, campsites]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border mb-8"
      style={{ height }}
    />
  );
}
