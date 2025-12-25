"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deletePhoto } from "../../actions/delete-photo";
import { Loader2, Trash2 } from "lucide-react";

export default function PhotoImage({
  photo,
}: {
  photo: { url: string; photoName: string; id: number };
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    try {
      setIsDeleting(true);

      const res = await deletePhoto(photo.id);

      if (!res?.success) {
        alert(res?.error ?? "Delete failed");
        setIsDeleting(false);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
      setIsDeleting(false);
    }
  }

  return (
    <div className="relative">
      <img
        src={photo.url}
        alt={photo.photoName}
        className="w-[300px] h-[300px] object-cover object-center rounded"
        loading="lazy"
      />

      {isDeleting && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Deleting...</p>
          </div>
        </div>
      )}

      <div className="absolute top-2 right-2">
        <Button
          type="submit"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
