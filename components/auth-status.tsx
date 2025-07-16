"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";
import { User as UserIcon } from "lucide-react";
import Link from "next/link";

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span className="text-sm text-white">Loading...</span>
      </div>
    );
  }

  return user ? (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-white">
        <UserIcon className="h-4 w-4" />
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