"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type FilterState = {
  rating: string;
  state: string;
  dateRange: string;
};

type Props = {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableStates: string[];
};

export default function CampsiteFilters({
  filters,
  onFilterChange,
  availableStates,
}: Props) {
  const clearFilters = () => {
    onFilterChange({
      rating: "all",
      state: "all",
      dateRange: "all",
    });
  };

  const hasActiveFilters =
    filters.rating !== "all" ||
    filters.state !== "all" ||
    filters.dateRange !== "all";

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Filter Campsites
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Rating Filter */}
          <div className="space-y-1.5">
            <Label htmlFor="rating-filter" className="text-xs">
              Rating
            </Label>
            <select
              id="rating-filter"
              value={filters.rating}
              onChange={(e) =>
                onFilterChange({ ...filters, rating: e.target.value })
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4+ stars</option>
              <option value="3">3+ stars</option>
              <option value="2">2+ stars</option>
              <option value="1">1+ star</option>
            </select>
          </div>

          {/* State Filter */}
          <div className="space-y-1.5">
            <Label htmlFor="state-filter" className="text-xs">
              State
            </Label>
            <select
              id="state-filter"
              value={filters.state}
              onChange={(e) =>
                onFilterChange({ ...filters, state: e.target.value })
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All states</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-1.5">
            <Label htmlFor="date-filter" className="text-xs">
              Date Visited
            </Label>
            <select
              id="date-filter"
              value={filters.dateRange}
              onChange={(e) =>
                onFilterChange({ ...filters, dateRange: e.target.value })
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All dates</option>
              <option value="last-month">Last 30 days</option>
              <option value="last-3-months">Last 3 months</option>
              <option value="last-6-months">Last 6 months</option>
              <option value="last-year">Last year</option>
              <option value="older">Older than 1 year</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
