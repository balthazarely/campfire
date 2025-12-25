import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect, notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import EditCampsiteModal from "@/app/components/campsites/editCampsiteModal";
import DeleteCampsiteButton from "@/app/components/campsites/deleteCampsiteButton";
import CampsiteMapView from "@/app/components/campsites/CampsiteMapView";
import PhotoUploader from "@/app/components/campsites/PhotoUploader";
import PhotoGrid from "@/app/components/campsites/PhotoGrid";
import {
  MapPin,
  Star,
  Calendar,
  Navigation,
  FileText,
  StickyNote,
} from "lucide-react";

interface PageProps {
  params: { id: string };
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCoord(n?: number | null) {
  if (n === null || n === undefined) return "—";
  return n.toFixed(6);
}

function Stars({ rating }: { rating: number | null }) {
  const r = rating ?? 0;
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < r
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground opacity-30"
          }`}
        />
      ))}
      <span className="text-sm font-medium ml-1">
        {rating ? `${rating}/5` : "No rating"}
      </span>
    </div>
  );
}

export default async function CampsitePage({ params }: PageProps) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const campsiteId = Number(params.id);
  if (!Number.isFinite(campsiteId)) notFound();

  const { data: campsite, error } = await supabase
    .from("campsites")
    .select("*")
    .eq("id", campsiteId)
    .eq("user_id", user.id)
    .single();

  if (error || !campsite) notFound();

  const mapsHref =
    campsite.lat != null && campsite.lng != null
      ? `https://www.google.com/maps?q=${campsite.lat},${campsite.lng}`
      : null;

  return (
    <main className="container mx-auto py-8 px-4">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/my-campsites">← Back to Campsites</Link>
      </Button>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{campsite.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-base">
                <MapPin className="w-4 h-4" />
                {campsite.city}, {campsite.state}, {campsite.country}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <EditCampsiteModal campsite={campsite} />
              <DeleteCampsiteButton id={campsite.id} name={campsite.name} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Map */}
          {campsite.lat != null && campsite.lng != null && (
            <>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Map View</div>
                <CampsiteMapView
                  lat={campsite.lat}
                  lng={campsite.lng}
                  height={300}
                  zoom={11}
                />
              </div>
              <Separator />
            </>
          )}

          {/* Rating and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Star className="w-4 h-4" />
                Rating
              </div>
              <Stars rating={campsite.rating} />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Visited
              </div>
              <p className="text-sm font-medium">
                {formatDate(campsite.date_visited)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {campsite.description?.trim() || "—"}
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Notes
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {campsite.notes?.trim() || "—"}
            </p>
          </div>

          <Separator />

          {/* Coordinates */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Coordinates
            </div>
            <div className="text-sm space-y-2">
              <p>
                <span className="font-medium">Latitude:</span>{" "}
                {formatCoord(campsite.lat)}
              </p>
              <p>
                <span className="font-medium">Longitude:</span>{" "}
                {formatCoord(campsite.lng)}
              </p>
              {mapsHref && (
                <Button asChild variant="default" size="sm" className="mt-2">
                  <a href={mapsHref} target="_blank" rel="noreferrer">
                    Open in Google Maps
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Photos */}
          <Separator />
          <div className="space-y-4">
            <PhotoUploader campsiteId={campsite.id} />
            <PhotoGrid campsiteId={campsite.id} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
