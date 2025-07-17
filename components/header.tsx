import Link from "next/link";
import { AuthStatus } from "./auth-status";
import { MobileMenu } from "./mobile-menu";
import { createClient } from "@/lib/supabase/server";

const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Research", href: "/research" },
  { name: "Contact", href: "/contact" },
];

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-primary-teal text-white sticky top-0 z-50">
      <div className="container-sare">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">SARE</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white hover:text-accent-coral transition-colors duration-200 font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Status - Client-side for real-time updates */}
          <div className="hidden md:block">
            <AuthStatus />
          </div>

          {/* Mobile Menu */}
          <MobileMenu navigationLinks={navigationLinks} user={user} />
        </div>
      </div>
    </header>
  );
}