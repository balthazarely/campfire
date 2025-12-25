"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deletePhoto(photoId: number) {
  if (!photoId || Number.isNaN(photoId)) {
    return { success: false, error: "Missing/invalid photoId" };
  }

  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: photo, error: fetchError } = await supabase
    .from("campsite_photos")
    .select("id, storage_path, campsite_id")
    .eq("id", photoId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !photo) {
    return { success: false, error: "Photo not found" };
  }

  const { error: storageError } = await supabase.storage
    .from("photos")
    .remove([photo.storage_path]);

  if (storageError) {
    return {
      success: false,
      error: `Storage delete failed: ${storageError.message}`,
    };
  }

  const { error: dbError } = await supabase
    .from("campsite_photos")
    .delete()
    .eq("id", photo.id)
    .eq("user_id", user.id);

  if (dbError) {
    return { success: false, error: `DB delete failed: ${dbError.message}` };
  }

  revalidatePath(`/my-campsites/${photo.campsite_id}`);
  return { success: true };
}
