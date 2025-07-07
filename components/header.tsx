import Link from "next/link";
import { AuthButton } from "./auth-button";
import { MobileMenu } from "./mobile-menu";
import { createClient } from "@/lib/supabase/server";

const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Research", href: "/research" },
  { name: "Purchase", href: "/purchase" },
  { name: "Certification", href: "/certification" },
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

          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            <AuthButton />
          </div>

          {/* Mobile Menu */}
          <MobileMenu navigationLinks={navigationLinks} user={user} />
        </div>
      </div>
    </header>
  );
}