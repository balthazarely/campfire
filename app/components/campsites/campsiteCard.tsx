import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Calendar, Locate } from "lucide-react";
import { Campsite } from "@/lib/types/Campsite";

export default function CampsiteCard({
  campsite,
  onLocate,
}: {
  campsite: Campsite;
  onLocate?: () => void;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{campsite.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs">
          <MapPin className="w-3 h-3" />
          {campsite.state}, {campsite.country}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">{campsite.date_visited}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{campsite.rating}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {onLocate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLocate}
                title="Locate on map"
              >
                <Locate className="w-4 h-4" />
              </Button>
            )}
            <Button asChild variant="default" size="sm">
              <Link href={`/my-campsites/${campsite.id}`}>View</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
