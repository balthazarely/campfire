"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Map as MapIcon } from "lucide-react";
import MyCampsitesMap from "@/app/components/campsites/MyCampsitesMap";
import CampsiteFilters, {
  FilterState,
} from "@/app/components/campsites/CampsiteFilters";
import { Campsite } from "@/lib/types/Campsite";
import CampsiteCard from "./campsiteCard";

export default function CampsitesView({
  campsites,
}: {
  campsites: Campsite[];
}) {
  const [showMap, setShowMap] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCampsiteId, setSelectedCampsiteId] = useState<number | null>(
    null
  );
  const [filters, setFilters] = useState<FilterState>({
    rating: "all",
    state: "all",
    dateRange: "all",
  });

  const hasActiveFilters =
    filters.rating !== "all" ||
    filters.state !== "all" ||
    filters.dateRange !== "all";

  // Get unique states for filter dropdown
  const availableStates = useMemo(() => {
    const states = new Set(campsites.map((c) => c.state).filter(Boolean));
    return Array.from(states).sort();
  }, [campsites]);

  // Filter campsites based on active filters
  const filteredCampsites = useMemo(() => {
    return campsites.filter((campsite) => {
      // Rating filter
      if (filters.rating !== "all") {
        const minRating = parseInt(filters.rating);
        if (!campsite.rating || campsite.rating < minRating) {
          return false;
        }
      }

      // State filter
      if (filters.state !== "all" && campsite.state !== filters.state) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== "all" && campsite.date_visited) {
        const visitedDate = new Date(campsite.date_visited);
        const now = new Date();
        const daysDiff = Math.floor(
          (now.getTime() - visitedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.dateRange) {
          case "last-month":
            if (daysDiff > 30) return false;
            break;
          case "last-3-months":
            if (daysDiff > 90) return false;
            break;
          case "last-6-months":
            if (daysDiff > 180) return false;
            break;
          case "last-year":
            if (daysDiff > 365) return false;
            break;
          case "older":
            if (daysDiff <= 365) return false;
            break;
        }
      }

      return true;
    });
  }, [campsites, filters]);

  return (
    <>
      {showMap ? (
        <div className="flex h-[calc(100vh-96px)]">
          {/* Left Column - Fixed Header + Scrollable Cards */}
          <div className="w-full lg:w-1/2 lg:pr-6 flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-background pb-6 mb-6 border-b">
              <h1 className="text-3xl font-bold mb-4">My Campsites</h1>

              {/* Filter Controls */}
              <div className="flex items-center justify-between gap-2">
                <div className="hidden lg:flex gap-2">
                  <Button
                    variant={showMap ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowMap(true)}
                  >
                    <MapIcon className="w-4 h-4 mr-2" />
                    Map View
                  </Button>
                  <Button
                    variant={!showMap ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowMap(false)}
                  >
                    Grid View
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filter
                </Button>
              </div>

              {showFilters && (
                <div className="mt-4">
                  <CampsiteFilters
                    filters={filters}
                    onFilterChange={setFilters}
                    availableStates={availableStates}
                  />
                </div>
              )}
            </div>

            {/* Scrollable Cards Container */}
            <div className="flex-1 overflow-y-auto">
              {filteredCampsites.length === 0 ? (
                hasActiveFilters ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg mb-2">
                      No campsites match your filters
                    </p>
                    <p className="text-sm">
                      Try adjusting your filter criteria
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg mb-4">
                      You don&apos;t have any campsites yet
                    </p>
                    <Button asChild>
                      <Link href="/new-campsite">Add your first campsite</Link>
                    </Button>
                  </div>
                )
              ) : (
                <div className="space-y-6 pb-12 ">
                  {filteredCampsites.map((campsite) => (
                    <CampsiteCard
                      key={campsite.id}
                      campsite={campsite}
                      onLocate={() => setSelectedCampsiteId(campsite.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Fixed Map */}
          <div className="hidden lg:block fixed right-0 top-16 w-1/2 h-[calc(100vh-96px)]">
            <div className="h-full w-full pl-6 pr-4">
              <MyCampsitesMap
                campsites={filteredCampsites}
                height="100%"
                selectedCampsiteId={selectedCampsiteId}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Sticky Header for Grid View */}
          <div className="sticky top-16 z-20 bg-background pb-6 mb-6 border-b">
            <h1 className="text-3xl font-bold mb-4">My Campsites</h1>

            {/* Filter Controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="hidden lg:flex gap-2">
                <Button
                  variant={showMap ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMap(true)}
                >
                  <MapIcon className="w-4 h-4 mr-2" />
                  Map View
                </Button>
                <Button
                  variant={!showMap ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMap(false)}
                >
                  Grid View
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                Filter
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4">
                <CampsiteFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  availableStates={availableStates}
                />
              </div>
            )}
          </div>

          {/* Cards Section - Grid View */}
          {filteredCampsites.length === 0 ? (
            hasActiveFilters ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No campsites match your filters</p>
                <p className="text-sm">Try adjusting your filter criteria</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-4">
                  You don&apos;t have any campsites yet
                </p>
                <Button asChild>
                  <Link href="/new-campsite">Add your first campsite</Link>
                </Button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {filteredCampsites.map((campsite) => (
                <CampsiteCard key={campsite.id} campsite={campsite} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
