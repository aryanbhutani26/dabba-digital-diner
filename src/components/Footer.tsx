import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">Indiya Bar & Restaurant</h3>
            <p className="text-sm text-white/80">
              Experience exceptional dining with exquisite cuisine and elegant ambiance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/menu" className="text-sm hover:text-accent transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-sm hover:text-accent transition-colors">
                  Reservations
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>123 Gourmet Street, Culinary District, CD 12345</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail size={16} />
                <span>info@indiya.com</span>
              </li>
            </ul>
          </div>

          {/* Hours & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-primary">Hours</h4>
            <div className="text-sm space-y-1">
              <p>Monday - Friday: 12:00 - 2:30 PM, 5:30 - 10:30 PM</p>
              <p>Saturday: 12:00 PM - 10:30 PM</p>
              <p>Sunday: 12:00 PM - 10:00 PM</p>
            </div>
            <div className="flex gap-4 pt-4">
              <a href="#" className="hover:text-accent transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/70">
          <p>&copy; {new Date().getFullYear()} Indiya Bar & Restaurant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
