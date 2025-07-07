import Link from "next/link";
import { Mail, Twitter, Linkedin, Facebook } from "lucide-react";

const secondaryNavLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Accessibility", href: "/accessibility" },
  { name: "Terms of Service", href: "/terms" },
];

const socialLinks = [
  { name: "Email", href: "mailto:hello@sare.com", icon: Mail },
  { name: "Twitter", href: "https://twitter.com/sare", icon: Twitter },
  { name: "LinkedIn", href: "https://linkedin.com/company/sare", icon: Linkedin },
  { name: "Facebook", href: "https://facebook.com/sare", icon: Facebook },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-charcoal text-white">
      <div className="container-sare py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Connect with us section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect with us</h3>
            <div className="flex items-center space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-white hover:text-accent-coral transition-colors duration-200"
                    aria-label={link.name}
                  >
                    <Icon size={20} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Secondary navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <nav className="flex flex-col space-y-2">
              {secondaryNavLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white hover:text-accent-coral transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">SARE</h3>
            <p className="text-sm text-gray-300">
              Discover a research backed exercise that reveals your signature strengths and helps you live from your best self every day.
            </p>
          </div>
        </div>

        {/* Copyright line */}
        <div className="border-t border-neutral-charcoal/20 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-300">
            © {currentYear} SARE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}