import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, Settings, LogOut, Package, User } from "lucide-react";
import { useState, useEffect } from "react";
import indiyaLogo from "@/assets/indiya-logo.jpg";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<any[]>([]);
  const [servicesEnabled, setServicesEnabled] = useState(false);
  const location = useLocation();
  const { user, isAdmin, isDeliveryBoy, signOut } = useAuth();

  useEffect(() => {
    fetchNavItems();
    fetchServicesVisibility();
  }, []);

  const fetchNavItems = async () => {
    try {
      const data = await api.getNavbarItems();
      setNavItems(data);
    } catch (error) {
      console.error('Failed to fetch navbar items:', error);
    }
  };

  const fetchServicesVisibility = async () => {
    try {
      const { enabled } = await api.getServicesVisibility();
      setServicesEnabled(enabled);
    } catch (error) {
      console.error('Failed to fetch services visibility:', error);
      setServicesEnabled(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-colors shrink-0">
              <img 
                src={indiyaLogo} 
                alt="Indiya Restaurant Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
              Indiya Bar & Restaurant
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isDeliveryBoy && navItems
              .filter(item => {
                // Hide Services link if services are disabled
                if (item.path === '/services' && !servicesEnabled) {
                  return false;
                }
                return true;
              })
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-base font-medium transition-colors hover:text-[#c3a85c] ${
                    isActive(item.path) ? "text-[#c3a85c]" : "text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            {!isDeliveryBoy && (
              <Button asChild size="default" className="bg-[#c3a85c] hover:bg-[#b8985a] text-black font-medium">
                <Link to="/reservations">Book a Table</Link>
              </Button>
            )}
            {user && (
              <>
                {!isAdmin && (
                  <Button asChild variant="outline" size="icon">
                    <Link to="/account">
                      <User className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {isDeliveryBoy && !isAdmin && (
                  <Button asChild variant="outline" size="icon">
                    <Link to="/delivery">
                      <Package className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
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
              <Button asChild className="bg-[#c3a85c] hover:bg-[#b8985a] text-black font-medium border-0">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fade-in bg-black/95">
            {!isDeliveryBoy && navItems
              .filter(item => {
                // Hide Services link if services are disabled
                if (item.path === '/services' && !servicesEnabled) {
                  return false;
                }
                return true;
              })
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block py-2 text-base font-medium transition-colors hover:text-[#c3a85c] ${
                    isActive(item.path) ? "text-[#c3a85c]" : "text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            {!isDeliveryBoy && (
              <Button asChild size="default" className="w-full bg-[#c3a85c] hover:bg-[#b8985a] text-black font-medium">
                <Link to="/reservations" onClick={() => setIsMobileMenuOpen(false)}>
                  Book a Table
                </Link>
              </Button>
            )}
            {user && (
              <>
                {!isAdmin && (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/account" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      My Account
                    </Link>
                  </Button>
                )}
                {isDeliveryBoy && !isAdmin && (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/delivery" onClick={() => setIsMobileMenuOpen(false)}>
                      <Package className="h-4 w-4 mr-2" />
                      Delivery Dashboard
                    </Link>
                  </Button>
                )}
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
              <Button asChild className="w-full bg-[#c3a85c] hover:bg-[#b8985a] text-black font-medium border-0">
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
