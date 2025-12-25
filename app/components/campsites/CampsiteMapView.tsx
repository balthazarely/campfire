"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Props = {
  lat: number;
  lng: number;
  height?: number;
  zoom?: number;
};

export default function CampsiteMapView({
  lat,
  lng,
  height = 260,
  zoom = 11,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom,
      interactive: true, // allow pan/zoom
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);

    mapRef.current = map;

    // important for initial paint/layout
    const t = setTimeout(() => map.resize(), 0);

    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [lat, lng, zoom]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border"
      style={{ height }}
    />
  );
}
