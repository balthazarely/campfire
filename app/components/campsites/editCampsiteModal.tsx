"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useFormStatus } from "react-dom";
import { updateCampsite } from "../../actions/update-campsite";
import MapPicker from "./mapPicker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { reverseGeocode } from "../../actions/reverse-geocode";
import { Pencil } from "lucide-react";

type Campsite = {
  id: number;
  name: string;
  description: string | null;
  date_visited: string | null;
  rating: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  notes: string | null;
  lat: number | null;
  lng: number | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

export default function EditCampsiteModal({
  campsite,
}: {
  campsite: Campsite;
}) {
  const [open, setOpen] = useState(false);

  const [values, setValues] = useState({
    name: "",
    description: "",
    date_visited: "",
    rating: "",
    city: "",
    state: "",
    country: "",
    notes: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (!open) return;
    setValues({
      name: campsite.name ?? "",
      description: campsite.description ?? "",
      date_visited: campsite.date_visited ?? "",
      rating: campsite.rating?.toString() ?? "",
      city: campsite.city ?? "",
      state: campsite.state ?? "",
      country: campsite.country ?? "",
      notes: campsite.notes ?? "",
      lat: campsite.lat?.toString() ?? "",
      lng: campsite.lng?.toString() ?? "",
    });
  }, [open, campsite]);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  const mapValue = useMemo(() => {
    const lat = Number(values.lat);
    const lng = Number(values.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [values.lat, values.lng]);

  async function action(formData: FormData) {
    await updateCampsite(formData);
    setOpen(false);
  }

  const [isGeoPending, startGeoTransition] = useTransition();
  const geoRequestIdRef = useRef(0);

  function handleMapChange(next: { lat: number; lng: number }) {
    setValues((v) => ({
      ...v,
      lat: String(next.lat),
      lng: String(next.lng),
    }));

    const requestId = ++geoRequestIdRef.current;

    startGeoTransition(async () => {
      try {
        const r = await reverseGeocode(next.lat, next.lng);

        if (requestId !== geoRequestIdRef.current) return;

        setValues((v) => ({
          ...v,
          city: r.city ?? "",
          state: r.state ?? "",
          country: r.country ?? "",
        }));
      } catch (err) {
        console.error("reverseGeocode failed:", err);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl">Edit Campsite</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] px-6">
          <form action={action} className="space-y-6 pb-6">
            <input type="hidden" name="id" value={campsite.id} />

            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Campsite Name
              </Label>
              <Input
                id="name"
                name="name"
                value={values.name}
                onChange={onChange}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={values.description}
                onChange={onChange}
                rows={4}
              />
            </div>

            <div className="h-px bg-border" />

            {/* Date and Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_visited" className="text-sm font-semibold">
                  Date Visited
                </Label>
                <Input
                  id="date_visited"
                  name="date_visited"
                  type="date"
                  value={values.date_visited}
                  onChange={onChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating" className="text-sm font-semibold">
                  Rating (1–5)
                </Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  value={values.rating}
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={values.notes}
                onChange={onChange}
                rows={3}
              />
            </div>
            {/* Location */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Location</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={values.city}
                    onChange={onChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-xs">
                    State
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={values.state}
                    onChange={onChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs">
                    Country
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={values.country}
                    onChange={onChange}
                  />
                </div>
              </div>
            </div>
            <div className="h-px bg-border" />

            {/* Map Picker */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Location Map</Label>
              <MapPicker
                value={mapValue}
                isOpen={open}
                zoomOnOpen={12}
                onChange={handleMapChange}
                height={280}
              />
              {isGeoPending && (
                <p className="text-xs text-muted-foreground">
                  Looking up city/state/country…
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Click to move the pin. Drag to fine-tune.
              </p>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat" className="text-sm font-semibold">
                  Latitude
                </Label>
                <Input
                  id="lat"
                  name="lat"
                  type="number"
                  step="any"
                  value={values.lat}
                  onChange={onChange}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lng" className="text-sm font-semibold">
                  Longitude
                </Label>
                <Input
                  id="lng"
                  name="lng"
                  type="number"
                  step="any"
                  value={values.lng}
                  onChange={onChange}
                  readOnly
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <SubmitButton />
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
