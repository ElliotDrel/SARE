import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSelfReflection } from "@/lib/supabase/database";
import ReportClient from "./report-client";
import { getStoriesForUser } from "@/lib/supabase/database";

export const metadata = {
  title: "Your SARE Report",
  description: "View and download your personalized SARE report based on your collected stories and self-reflections.",
};

export default async function ReportPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const [selfReflection, stories] = await Promise.all([
    getSelfReflection(user.id),
    getStoriesForUser(user.id),
  ]);

  return (
    <div className="container-sare py-10">
      <ReportClient
        user={user}
        selfReflection={selfReflection}
        stories={stories}
      />
    </div>
  );
} 