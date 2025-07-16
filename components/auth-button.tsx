"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import { EnvVarWarning } from "./env-var-warning";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { hasEnvVars } from "@/lib/utils";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have environment variables first
    if (!hasEnvVars) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Show environment variable warning if env vars are missing
  if (!hasEnvVars) {
    return <EnvVarWarning />;
  }

  // Show loading state to prevent hydration mismatch
  if (isLoading) {
    return (
      <div className="flex gap-2">
        <div className="h-9 w-16 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-9 w-16 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return user ? (
    <LogoutButton />
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
