"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type LngLat = { lng: number; lat: number };

type Props = {
  value: LngLat | null;
  onChange: (v: LngLat) => void;
  height?: number;

  // For modals: pass open state so we can resize + optionally center once
  isOpen?: boolean;

  // When opening with an existing pin, start zoomed in there
  zoomOnOpen?: number; // e.g. 10-14
};

export default function MapPicker({
  value,
  onChange,
  height = 280,
  isOpen,
  zoomOnOpen = 11,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // ✅ keep latest onChange without retriggering map init
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // used to only "zoom-to-pin" once per open
  const didCenterThisOpenRef = useRef(false);

  // 1) Init map ONCE (no deps that change per render)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [-98.5795, 39.8283],
      zoom: 3,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("click", (e) => {
      const next = { lng: e.lngLat.lng, lat: e.lngLat.lat };

      // Create marker if missing
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ draggable: true })
          .setLngLat([next.lng, next.lat])
          .addTo(map);

        markerRef.current.on("dragend", () => {
          const ll = markerRef.current!.getLngLat();
          onChangeRef.current({ lng: ll.lng, lat: ll.lat });
        });
      } else {
        markerRef.current.setLngLat([next.lng, next.lat]);
      }

      // IMPORTANT: do NOT call setCenter/flyTo here
      onChangeRef.current(next);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // 2) Sync marker when value changes (NO viewport movement)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([value.lng, value.lat])
        .addTo(map);

      markerRef.current.on("dragend", () => {
        const ll = markerRef.current!.getLngLat();
        onChangeRef.current({ lng: ll.lng, lat: ll.lat });
      });
    } else {
      markerRef.current.setLngLat([value.lng, value.lat]);
    }
  }, [value]);

  // 3) Modal open: resize + center/zoom ONCE to existing pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!isOpen) {
      didCenterThisOpenRef.current = false;
      return;
    }

    // Let dialog + scroll layout settle, then resize
    const t = setTimeout(() => {
      map.resize();

      if (value && !didCenterThisOpenRef.current) {
        didCenterThisOpenRef.current = true;
        map.jumpTo({
          center: [value.lng, value.lat],
          zoom: zoomOnOpen,
        });
      }
    }, 50);

    return () => clearTimeout(t);
  }, [isOpen, value, zoomOnOpen]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border"
      style={{ height }}
    />
  );
}
