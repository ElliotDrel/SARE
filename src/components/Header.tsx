import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-foreground">SARE</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-smooth">
            About
          </Link>
          <Link to="/research" className="text-muted-foreground hover:text-foreground transition-smooth">
            Research
          </Link>
          <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-smooth">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Link to="/sign-in">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/sign-up">
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;