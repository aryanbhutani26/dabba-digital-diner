import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import indiyaLogo from "@/assets/indiya-logo.jpg";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<any[]>([]);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    fetchNavItems();
  }, []);

  const fetchNavItems = async () => {
    const { data } = await supabase
      .from("navbar_items")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    
    if (data) {
      setNavItems(data);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={indiyaLogo} alt="Indiya Bar & Restaurant Logo" className="h-12 w-12 object-contain" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Indiya Bar & Restaurant
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-base font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? "text-primary" : "text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Button asChild variant="hero" size="default">
              <Link to="/reservations">Book a Table</Link>
            </Button>
            {user && (
              <>
                {isAdmin && (
                  <Button asChild variant="outline" size="icon">
                    <Link to="/admin">
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
            {!user && (
              <Button asChild variant="outline">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block py-2 text-base font-medium transition-colors hover:text-primary ${
                  isActive(item.path) ? "text-primary" : "text-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button asChild variant="hero" size="default" className="w-full">
              <Link to="/reservations" onClick={() => setIsMobileMenuOpen(false)}>
                Book a Table
              </Link>
            </Button>
            {user && (
              <>
                {isAdmin && (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
            {!user && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
