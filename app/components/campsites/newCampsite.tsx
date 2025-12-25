"use client";

import { useMemo, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Star,
  Navigation,
  MapPin,
  Loader2,
  FileText,
  StickyNote,
} from "lucide-react";
import MapPicker from "./mapPicker";
import { createCampsite } from "@/app/actions/create-campsite";
import { reverseGeocode } from "@/app/actions/reverse-geocode";

type LngLat = { lng: number; lat: number };

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className="w-full sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        "Save Campsite"
      )}
    </Button>
  );
}

function FormOverlay() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-lg">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}

export default function NewCampsiteForm() {
  const [coords, setCoords] = useState<LngLat | null>(null);
  const [stateVal, setStateVal] = useState("");
  const [countryVal, setCountryVal] = useState("");
  const [cityVal, setCityVal] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleMapChange(next: LngLat) {
    setCoords(next);

    startTransition(async () => {
      try {
        const r = await reverseGeocode(next.lat, next.lng);
        setCityVal(r.city ?? "");
        setStateVal(r.state ?? "");
        setCountryVal(r.country ?? "");
      } catch {
        // ignore
      }
    });
  }

  const lat = useMemo(() => (coords ? String(coords.lat) : ""), [coords]);
  const lng = useMemo(() => (coords ? String(coords.lng) : ""), [coords]);

  return (
    <div className="container mx-auto max-w-2xl px-4 relative">
      <form action={createCampsite} className="relative">
        <FormOverlay />
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-3xl">Add Campsite</CardTitle>
            <CardDescription className="flex items-center gap-1 text-base">
              <MapPin className="w-4 h-4" />
              Pin the location and fill in the details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Campsite Name <span className="text-red-500">*</span>
              </div>
              <Input id="name" name="name" required />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </div>
              <Textarea id="description" name="description" rows={4} />
            </div>

            <Separator />

            {/* Date & Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Visited <span className="text-red-500">*</span>
                </div>
                <Input
                  id="date_visited"
                  name="date_visited"
                  type="date"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Rating (1–5)
                </div>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                Notes
              </div>
              <Textarea id="notes" name="notes" rows={3} />
            </div>

            <Separator />

            {/* Map Picker */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Location Map</div>
              <MapPicker
                value={coords}
                onChange={handleMapChange}
                height={280}
              />
              {isPending ? (
                <p className="text-xs text-muted-foreground">
                  Looking up city/state/country…
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Click to move the pin. Drag to fine-tune.
                </p>
              )}
            </div>

            {/* Location (auto-filled, editable) */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location <span className="text-red-500">*</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={cityVal}
                    onChange={(e) => setCityVal(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-xs">
                    State
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs">
                    Country
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={countryVal}
                    onChange={(e) => setCountryVal(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Coordinates */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Coordinates <span className="text-red-500">*</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat" className="text-xs">
                    Latitude
                  </Label>
                  <Input id="lat" name="lat" value={lat} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng" className="text-xs">
                    Longitude
                  </Label>
                  <Input id="lng" name="lng" value={lng} readOnly />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              {!coords ? (
                <p className="text-xs text-red-500">
                  Set a location on the map to enable saving.
                </p>
              ) : (
                <div />
              )}
              <SubmitButton disabled={!coords} />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
