import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { Campsite } from "@/lib/types/Campsite";
import CampsitesView from "../components/campsites/CampsitesView";

export default async function MyCampsites() {
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

  if (!user) redirect("/");

  const { data: campsite, error } = (await supabase
    .from("campsites")
    .select("*")
    .eq("user_id", user!.id)
    .order("date_visited", { ascending: false })) as {
    data: Campsite[] | null;
    error: any;
  };

  return (
    <main>
      <CampsitesView campsites={campsite ?? []} />
    </main>
  );
}
