import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import { DeliveryBoyRedirect } from "@/components/DeliveryBoyRedirect";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Reservations from "./pages/Reservations";
import Gallery from "./pages/Gallery";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Delivery from "./pages/Delivery";
import TrackOrder from "./pages/TrackOrder";
import Account from "./pages/Account";
import OrderConfirmation from "./pages/OrderConfirmation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<DeliveryBoyRedirect><Index /></DeliveryBoyRedirect>} />
            <Route path="/menu" element={<DeliveryBoyRedirect><Menu /></DeliveryBoyRedirect>} />
            <Route path="/about" element={<DeliveryBoyRedirect><About /></DeliveryBoyRedirect>} />
            <Route path="/services" element={<DeliveryBoyRedirect><Services /></DeliveryBoyRedirect>} />
            <Route path="/contact" element={<DeliveryBoyRedirect><Contact /></DeliveryBoyRedirect>} />
            <Route path="/reservations" element={<DeliveryBoyRedirect><Reservations /></DeliveryBoyRedirect>} />
            <Route path="/gallery" element={<DeliveryBoyRedirect><Gallery /></DeliveryBoyRedirect>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/track-order" element={<DeliveryBoyRedirect><TrackOrder /></DeliveryBoyRedirect>} />
            <Route path="/order-confirmation" element={<DeliveryBoyRedirect><OrderConfirmation /></DeliveryBoyRedirect>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
