"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";

export async function updateCampsite(formData: FormData) {
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
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const idRaw = formData.get("id");
  const id = Number(idRaw);
  if (!Number.isFinite(id)) throw new Error("Invalid campsite id");

  // helpers
  const s = (k: string) => {
    const v = formData.get(k);
    if (v === null) return undefined;
    const str = String(v).trim();
    return str === "" ? null : str;
  };
  const n = (k: string) => {
    const v = formData.get(k);
    if (v === null) return undefined;
    const str = String(v).trim();
    if (str === "") return null;
    const num = Number(str);
    if (!Number.isFinite(num)) throw new Error(`Invalid number for ${k}`);
    return num;
  };

  // Build update payload from submitted fields
  // (Undefined = not provided; Null = clear the value)
  const patch: Record<string, any> = {
    name: s("name"),
    description: s("description"),
    date_visited: s("date_visited"),
    city: s("city"),
    state: s("state"),
    country: s("country"),
    notes: s("notes"),
    rating: n("rating"),
    lat: n("lat"),
    lng: n("lng"),
  };

  // Remove keys that weren't included in the form submission at all
  // (in our modal we submit all fields, but this keeps it robust)
  Object.keys(patch).forEach((k) => {
    if (patch[k] === undefined) delete patch[k];
  });

  if (typeof patch.name === "string" && patch.name.length === 0) {
    throw new Error("Name is required");
  }

  const { error } = await supabase
    .from("campsites")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  // Revalidate both the list and detail pages
  revalidatePath("/my-campsites");
  revalidatePath(`/my-campsites/${id}`);
}
