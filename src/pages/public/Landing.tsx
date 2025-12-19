import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Timer, 
  Smile, 
  DollarSign, 
  ChevronRight,
  Star,
  Check,
  ArrowRight
} from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";
import fleetImage from "@/assets/fleet-image.jpg";

const benefits = [
  {
    icon: Timer,
    title: "Increased Pace of Play",
    description: "Single riders complete rounds faster, reducing course congestion and improving the experience for all golfers.",
  },
  {
    icon: Smile,
    title: "Fun & Memorable",
    description: "Give your members and guests an exciting, unique way to navigate the course that they'll talk about for years.",
  },
  {
    icon: DollarSign,
    title: "Revenue Booster",
    description: "Premium rental fees and increased round capacity translate directly to your bottom line.",
  },
];

const vehicles = [
  {
    name: "CP7 3-Wheel Trike",
    description: "Our flagship articulating trike with superior stability and a smooth ride on any terrain.",
    features: ["Fat tyres for all conditions", "Articulating front wheel", "Large storage basket", "Premium seat comfort"],
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop",
  },
  {
    name: "2-Wheel Golf Cruiser",
    description: "Compact and nimble, perfect for courses seeking a minimalist approach with maximum fun.",
    features: ["Lightweight design", "Easy to maneuver", "Quick charge battery", "Compact footprint"],
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop",
  },
];

const testimonials = [
  {
    name: "Mike K.",
    role: "Club Manager, Brisbane Golf Club",
    quote: "Since introducing Golf Chariots, our rental revenue has increased by 40%. Members absolutely love them!",
    rating: 5,
  },
  {
    name: "Raza A.",
    role: "Head Pro, Gold Coast Links",
    quote: "The pace of play improvement has been remarkable. Single riders are finishing 30 minutes faster on average.",
    rating: 5,
  },
  {
    name: "Emma D.",
    role: "Operations Manager, Sydney Shores",
    quote: "Professional service from start to finish. The trikes are reliable, fun, and our guests can't get enough.",
    rating: 5,
  },
];

const pricingOptions = [
  {
    title: "Ex-Rental",
    subtitle: "Pre-loved vehicles",
    price: "From $2,000",
    description: "Quality refurbished scooters with full warranty",
    features: ["Fully serviced", "3-month warranty", "Spare parts included"],
    featured: false,
  },
  {
    title: "New",
    subtitle: "Brand new vehicles",
    price: "From $4,500",
    description: "Factory fresh scooters with full manufacturer warranty",
    features: ["Brand new condition", "Full manufacturer warranty", "Latest models"],
    featured: false,
  },
  {
    title: "Leasing",
    subtitle: "Flexible terms",
    price: "From $50/week",
    description: "No large upfront cost, all maintenance included",
    features: ["No deposit required", "Maintenance included", "Swap for newer models", "Cancel anytime after 12 months"],
    featured: true,
  },
];

export default function Landing() {
  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroBackground})` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
        
        <div className="relative w-full py-20 px-6 md:px-12 lg:px-16">
          <div className="max-w-xl text-left">
              <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6 animate-fade-in">
                Australia's #1 Golf Scooter Supplier
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight animate-slide-up">
                FAT TYRE<br />
                <span className="text-accent">GOLF SCOOTERS</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
                Transform your course with premium single-rider scooters. Increase pace of play, 
                boost revenue, and give golfers an unforgettable experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-start animate-slide-up" style={{ animationDelay: "200ms" }}>
                <Link to="/fleet">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-lg px-8">
                    Explore Our Fleet
                    <ChevronRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-lg px-8">
                    Get A Quote
                  </Button>
                </Link>
              </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-primary-foreground/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Golf Chariots?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join the growing number of Australian courses revolutionizing the golfing experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-card bg-card hover:shadow-elevated transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-accent font-semibold text-sm tracking-widest uppercase mb-4 block">
                Our Story
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Golf Chariots Australia
              </h2>
              <p className="text-muted-foreground mb-6">
                Founded by passionate golfers and industry veterans, Golf Chariots Australia is the nation's 
                leading supplier of premium fat tyre golf scooters. We've partnered with courses across 
                Queensland, New South Wales, and Victoria to bring this exciting revolution to Australian golf.
              </p>
              <p className="text-muted-foreground mb-8">
                Our mission is simple: make golf more fun, more accessible, and more profitable for courses 
                of all sizes. Whether you're looking to purchase, lease, or trial, we have a solution that 
                fits your needs.
              </p>
              <Link to="/contact">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Learn More About Us
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src={fleetImage}
                alt="Fleet of golf scooters"
                className="rounded-2xl shadow-hero w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-6 rounded-xl shadow-elevated">
                <div className="font-display font-bold text-2xl">Lease a Fleet</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Preview */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Our Fleet
            </h2>
            <p className="text-primary-foreground/70 max-w-2xl mx-auto">
              Premium quality scooters designed for the Australian golf environment
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {vehicles.map((vehicle, index) => (
              <Card key={index} className="bg-primary-foreground/10 border-primary-foreground/20 overflow-hidden hover:bg-primary-foreground/15 transition-colors">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-2xl text-primary-foreground mb-2">
                    {vehicle.name}
                  </h3>
                  <p className="text-primary-foreground/70 mb-4">{vehicle.description}</p>
                  <ul className="space-y-2 mb-6">
                    {vehicle.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-primary-foreground/80">
                        <Check className="w-4 h-4 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/fleet">
                    <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                      View Details
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/fleet">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                View Full Fleet
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Flexible Options
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you want to buy or lease, we have a solution that works for your course
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingOptions.map((option, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden ${
                  option.featured 
                    ? "border-accent shadow-hero ring-2 ring-accent/20" 
                    : "border-border shadow-card"
                }`}
              >
                {option.featured && (
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h3 className="font-display font-semibold text-2xl text-foreground">{option.title}</h3>
                    <p className="text-muted-foreground text-sm">{option.subtitle}</p>
                  </div>
                  <div className="mb-6">
                    <span className="font-display text-4xl font-bold text-primary">{option.price}</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{option.description}</p>
                  <ul className="space-y-3 mb-8">
                    {option.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-foreground">
                        <Check className="w-5 h-5 text-accent shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact">
                    <Button 
                      className={`w-full ${
                        option.featured 
                          ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Partners Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trusted by courses across Australia
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="text-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Course?
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto mb-8">
            Join the growing number of Australian golf courses offering fat tyre scooters. 
            Get in touch today for a free consultation and quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-lg px-8">
                Get Your Free Quote
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <a href="tel:+61400000000">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-lg px-8">
                Call Us Now
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}