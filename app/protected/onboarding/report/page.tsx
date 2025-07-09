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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const [selfReflectionResponse, storiesResponse] = await Promise.all([
    getSelfReflection(user.id),
    getStoriesForUser(user.id),
  ]);

  // Extract data from Supabase responses
  const selfReflection = selfReflectionResponse.data;
  const stories = storiesResponse.data || [];

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