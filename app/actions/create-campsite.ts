// app/campsites/actions.ts
"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCampsite(formData: FormData) {
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

  const payload = {
    user_id: user.id,
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "") || null,
    date_visited: String(formData.get("date_visited") ?? "") || null,
    rating: formData.get("rating") ? Number(formData.get("rating")) : null,
    city: String(formData.get("city") ?? "") || null,
    state: String(formData.get("state") ?? "") || null,
    country: String(formData.get("country") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
    lat: formData.get("lat") ? Number(formData.get("lat")) : null,
    lng: formData.get("lng") ? Number(formData.get("lng")) : null,
  };

  if (!payload.name) throw new Error("Name is required");
  console.log(payload);

  const { error } = await supabase.from("campsites").insert(payload);
  if (error) throw new Error(error.message);

  // refresh the server-rendered list
  revalidatePath("/my-campsites");

  // 🚀 navigate after success
  redirect("/my-campsites?created=1");
}
