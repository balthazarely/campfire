import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyCampsitesLoading() {
  return (
    <main>
      <div className="flex h-[calc(100vh-96px)]">
        {/* Left Column - Fixed Header + Scrollable Cards */}
        <div className="w-full lg:w-1/2 lg:pr-6 flex flex-col">
          {/* Fixed Header Skeleton */}
          <div className="flex-shrink-0 bg-background pb-6 mb-6 border-b">
            <Skeleton className="h-9 w-48 mb-4" />

            {/* Filter Controls Skeleton */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-24" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          </div>

          {/* Scrollable Cards Skeleton */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 pb-12">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Fixed Map Skeleton */}
        <div className="hidden lg:block fixed right-0 top-16 w-1/2 h-[calc(100vh-96px)]">
          <div className="h-full w-full pl-6 pr-4">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
