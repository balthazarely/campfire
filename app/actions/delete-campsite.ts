// app/campsites/actions/delete-campsite.ts
"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteCampsite(formData: FormData) {
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
    throw new Error("Unauthorized");
  }

  const idRaw = formData.get("id");
  const id = Number(idRaw);
  if (!Number.isFinite(id)) {
    throw new Error("Invalid campsite id");
  }

  const { error } = await supabase
    .from("campsites")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  // refresh list + bounce user back to list after deleting from detail page
  revalidatePath("/my-campsites");
  redirect("/my-campsites");
}
