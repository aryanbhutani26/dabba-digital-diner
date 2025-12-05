import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  Package,
  BarChart3,
  Settings,
  Users,
  Ticket,
  Sparkles,
  Calendar,
  Navigation as NavigationIcon,
  Menu as MenuIcon,
  LogOut,
  ExternalLink,
  X,
  Home,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  newOrdersCount?: number;
  newReservationsCount?: number;
}

export const AdminLayout = ({ children, newOrdersCount = 0, newReservationsCount = 0 }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { path: "/admin/orders", label: "Orders", icon: Package, badge: newOrdersCount },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/admin/general", label: "General", icon: Settings },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/coupons", label: "Coupons", icon: Ticket },
    { path: "/admin/promotions", label: "Promotions", icon: Sparkles },
    { path: "/admin/reservations", label: "Reservations", icon: Calendar, badge: newReservationsCount },
    { path: "/admin/navigation", label: "Navigation", icon: NavigationIcon },
    { path: "/admin/menu", label: "Menu", icon: MenuIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>

          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">I</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold">Indiya Restaurant</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* View Live Site */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link to="/" target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live Site
              </Link>
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)]
            w-64 border-r bg-background/95 backdrop-blur
            transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="flex flex-col gap-1 p-4">
            {/* Dashboard Home */}
            <Link
              to="/admin"
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors hover:bg-accent hover:text-accent-foreground
                ${location.pathname === '/admin' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="my-2 border-t" />

            {/* Menu Items */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors hover:bg-accent hover:text-accent-foreground
                    ${isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center px-1">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}

            <div className="my-2 border-t" />

            {/* Mobile: View Live Site */}
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <ExternalLink className="h-4 w-4" />
              View Live Site
            </Link>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
