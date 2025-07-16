"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button 
      onClick={logout}
      size="sm"
      variant="outline"
      className="bg-white text-primary-teal hover:bg-gray-100 flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
