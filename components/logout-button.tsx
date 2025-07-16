"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        setIsLoading(false);
        return;
      }
      
      // Wait a bit for the auth state change to propagate
      setTimeout(() => {
        router.push("/");
        setIsLoading(false);
      }, 200);
      
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={logout} disabled={isLoading} variant="outline" size="sm">
      {isLoading ? "Signing out..." : "Log Out"}
    </Button>
  );
}
