"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Only redirect to login if we're on a protected page
      // Otherwise, stay on current page and let header show login buttons
      const currentPath = window.location.pathname;
      const isProtectedPage = currentPath.startsWith('/protected');
      
      if (isProtectedPage) {
        router.push("/auth/login");
      } else {
        // Stay on current page, header will automatically show login/signup buttons
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={logout}
      size="sm"
      variant="outline"
      className="bg-white text-primary-teal hover:bg-gray-100 flex items-center gap-2"
      disabled={isLoading}
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
