"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";
import { Badge } from "./ui/badge";
import { Menu, X } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { hasEnvVars } from "@/lib/utils";

interface NavigationLink {
  name: string;
  href: string;
}

interface MobileMenuProps {
  navigationLinks: NavigationLink[];
  user: User | null;
  isLoading?: boolean;
}

export function MobileMenu({ navigationLinks, user, isLoading = false }: MobileMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden text-white hover:text-accent-coral hover:bg-primary-teal/80"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-primary-teal border-t border-primary-teal/20 py-4 md:hidden">
          <div className="container-sare">
            <nav className="flex flex-col space-y-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white hover:text-accent-coral transition-colors duration-200 font-medium block py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-primary-teal/20">
              {!hasEnvVars ? (
                <div className="flex flex-col gap-2">
                  <Badge variant={"outline"} className="font-normal text-white border-white">
                    Supabase environment variables required
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant={"outline"} disabled className="bg-white/20 text-white border-white">
                      Sign in
                    </Button>
                    <Button size="sm" variant={"default"} disabled className="bg-white/20 text-white">
                      Sign up
                    </Button>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex gap-2">
                  <div className="h-9 w-16 bg-white/20 animate-pulse rounded"></div>
                  <div className="h-9 w-16 bg-white/20 animate-pulse rounded"></div>
                </div>
              ) : user ? (
                <div className="flex flex-col gap-2">
                  <div className="text-white text-sm">
                    Hey, {user.email}!
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
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}