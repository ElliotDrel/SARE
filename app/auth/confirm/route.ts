import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/protected";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });
    
    if (!error) {
      // Redirect to confirmation success page with next URL
      redirect(`/auth/confirm-success?next=${encodeURIComponent(next)}`);
    } else {
      // Redirect to confirmation error page with error message
      redirect(`/auth/confirm-error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Redirect to confirmation error page for missing parameters
  redirect(`/auth/confirm-error?error=${encodeURIComponent("Invalid confirmation link. Please check your email and try again.")}`);
}
