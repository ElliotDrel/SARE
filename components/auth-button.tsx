import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { User, LogOut } from "lucide-react";

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-white">
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">{user.email}</span>
      </div>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline" className="bg-white text-primary-teal hover:bg-gray-100">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" className="bg-accent-coral hover:bg-accent-coral/90">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
