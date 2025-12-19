import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <span className="font-display font-bold text-accent-foreground text-xl">GC</span>
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight">
                  Golf Chariots
                </span>
                <span className="block text-primary-foreground/70 text-xs tracking-widest uppercase">
                  Australia
                </span>
              </div>
            </div>
            <p className="text-primary-foreground/70 max-w-md mb-6">
              Australia's leading supplier of fat tyre golf scooters. Increase pace of play, 
              boost revenue, and give your members an unforgettable experience on the course.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/fleet" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Our Fleet
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-primary-foreground/70 hover:text-accent transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-accent mt-1 shrink-0" />
                <a href="tel:+61400000000" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  0400 000 000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-accent mt-1 shrink-0" />
                <a href="mailto:info@golfchariots.com.au" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  info@golfchariots.com.au
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-1 shrink-0" />
                <span className="text-primary-foreground/70">
                  Brisbane, Queensland<br />Australia
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © {currentYear} Golf Chariots Australia. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/contact" className="text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/contact" className="text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}