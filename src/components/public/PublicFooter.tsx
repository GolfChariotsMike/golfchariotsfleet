import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import logo from "@/assets/golf-chariots-logo.png";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img 
                src={logo} 
                alt="Golf Chariots Australia" 
                className="h-12 md:h-16 w-auto invert"
              />
            </Link>
            <p className="text-primary-foreground/70 max-w-md mb-6">
              Australia's leading supplier of fat tyre golf scooters. Increase pace of play, 
              boost revenue, and give your members an unforgettable experience on the course.
            </p>
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
                <Mail size={18} className="text-accent mt-1 shrink-0" />
                <a href="mailto:info@golfchariots.com.au" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  info@golfchariots.com.au
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-1 shrink-0" />
                <span className="text-primary-foreground/70">
                  Perth, Western Australia
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