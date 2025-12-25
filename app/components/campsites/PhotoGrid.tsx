import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import PhotoImage from "./Image";

type Props = {
  campsiteId: number;
};

export default async function PhotoGrid({ campsiteId }: Props) {
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

  if (!user) return null;

  // 1️⃣ Fetch photo rows from DB (THIS is where row.id comes from)
  const { data: rows, error } = await supabase
    .from("campsite_photos")
    .select("id, storage_path, original_name")
    .eq("campsite_id", campsiteId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !rows) {
    console.error("PhotoGrid DB error:", error);
    return null;
  }

  // 2️⃣ Convert storage_path → signed URL
  const photos = await Promise.all(
    rows.map(async (row) => {
      const { data, error } = await supabase.storage
        .from("photos")
        .createSignedUrl(row.storage_path, 60 * 60);

      if (error || !data) {
        console.error("Signed URL error:", error);
        return null;
      }

      // ✅ THIS OBJECT is what your delete form relies on
      return {
        url: data.signedUrl,
        photoName: row.original_name ?? "Photo",
        id: row.id, // <-- IMPORTANT
      };
    })
  );

  const validPhotos = photos.filter(Boolean) as {
    url: string;
    photoName: string;
    id: number;
  }[];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {validPhotos.map((photo) => (
        <PhotoImage key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
