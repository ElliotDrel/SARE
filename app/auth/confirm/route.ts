import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  console.log("Auth confirm - Type:", type, "Token hash:", token_hash ? "present" : "missing");

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });

    if (!error) {
      // Handle different auth types
      if (type === 'recovery') {
        // For password recovery, redirect to update password page
        console.log("Password recovery confirmed, redirecting to update-password");
        redirect("/auth/update-password");
      } else {
        // For other types (signup, email confirmation), redirect to specified URL
        redirect(next);
      }
    } else {
      console.error("Auth verification error:", error);
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // redirect the user to an error page with some instructions
  console.error("Auth confirm - Missing token hash or type");
  redirect(`/auth/error?error=${encodeURIComponent("Invalid or missing authentication parameters")}`);
}
