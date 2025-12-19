import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Check, 
  ArrowRight, 
  Battery, 
  Gauge, 
  Weight,
  Ruler,
  ShieldCheck
} from "lucide-react";
import cp7TrikeSide from "@/assets/cp7-trike-side.jpg";
import cp7TrikeFront from "@/assets/cp7-trike-front.jpg";
import cruiserFront from "@/assets/2wheel-cruiser-front.jpg";
import cruiserSide from "@/assets/2wheel-cruiser-side.jpg";
import cruiserGroup from "@/assets/2wheel-cruiser-group.jpg";

const vehicles = [
  {
    id: "cp7-trike",
    name: "CP7 3-Wheel Trike",
    tagline: "The Ultimate Golf Experience",
    description: "Our flagship articulating trike offers superior stability and comfort on any terrain. The unique rear wheel articulation provides exceptional maneuverability while maintaining a smooth, safe ride throughout your round.",
    image: cp7TrikeSide,
    gallery: [
      cp7TrikeSide,
      cp7TrikeFront,
    ],
    features: [
      "Articulating rear wheel for smooth turns",
      "Fat tyres for all-terrain capability",
      "Large rear storage area",
      "Premium padded seat",
      "Lithium-Ion \"Quick-Swap\" Battery",
      "LED headlight included",
    ],
    specs: [
      { icon: Battery, label: "Range", value: "36 holes" },
      { icon: Gauge, label: "Top Speed", value: "25 km/h" },
      { icon: Weight, label: "Weight Capacity", value: "200 kg" },
      { icon: Ruler, label: "Dimensions", value: "187 × 85 × 114.5 cm" },
    ],
    pricing: {
      purchase: "$6,500",
      exRental: "$4,000",
      lease: "$65/week",
    },
  },
  {
    id: "2-wheel-cruiser",
    name: "2-Wheel Golf Cruiser",
    tagline: "Compact & Nimble",
    description: "Perfect for courses seeking a minimalist approach with maximum fun. The 2-Wheel Cruiser offers a more dynamic riding experience with a smaller footprint, making it ideal for tighter courses or those new to golf scooters.",
    image: cruiserSide,
    gallery: [
      cruiserFront,
      cruiserGroup,
    ],
    features: [
      "Lightweight aluminum frame",
      "Quick-charge lithium battery",
      "Compact storage footprint",
      "Intuitive controls",
    ],
    specs: [
      { icon: Battery, label: "Range", value: "36 holes" },
      { icon: Gauge, label: "Top Speed", value: "25 km/h" },
      { icon: Weight, label: "Weight Capacity", value: "110 kg" },
      { icon: Ruler, label: "Dimensions", value: "130 × 55 × 100 cm" },
    ],
    pricing: {
      purchase: "$4,500",
      exRental: "From $2,000",
      lease: "$45/week",
    },
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Full Warranty",
    description: "All vehicles come with comprehensive warranty coverage",
  },
  {
    icon: Battery,
    title: "Quality Batteries",
    description: "Premium lithium batteries with long life and fast charging",
  },
  {
    icon: Check,
    title: "Training Included",
    description: "On-site training for your staff at no extra cost",
  },
];

export default function Fleet() {
  return (
    <div className="page-transition pt-20">
      {/* Hero */}
      <section className="relative py-20 md:py-32 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-transparent" />
        </div>
        <div className="container-wide relative">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6">
              Premium Quality
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Our Fleet
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl">
              Explore our range of premium fat tyre golf scooters, designed specifically 
              for Australian golf courses. Quality, reliability, and fun guaranteed.
            </p>
          </div>
        </div>
      </section>

      {/* Vehicle Listings */}
      <section className="section-padding">
        <div className="container-wide space-y-20">
          {vehicles.map((vehicle, index) => (
            <div 
              key={vehicle.id}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <img 
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="rounded-2xl shadow-hero w-full"
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {vehicle.gallery.map((img, i) => (
                    <img 
                      key={i}
                      src={img}
                      alt={`${vehicle.name} view ${i + 1}`}
                      className="rounded-lg shadow-card w-full aspect-video object-cover"
                    />
                  ))}
                </div>
              </div>
              
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <span className="text-accent font-semibold text-sm tracking-widest uppercase mb-2 block">
                  {vehicle.tagline}
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {vehicle.name}
                </h2>
                <p className="text-muted-foreground mb-6">{vehicle.description}</p>
                
                {/* Specs */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {vehicle.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <spec.icon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">{spec.label}</div>
                        <div className="font-semibold text-foreground">{spec.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Key Features</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {vehicle.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="w-4 h-4 text-accent shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Pricing */}
                <Card className="bg-secondary border-0 mb-6">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-4">Pricing Options</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">New Purchase</div>
                        <div className="font-display font-bold text-primary">{vehicle.pricing.purchase}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Ex-Rental</div>
                        <div className="font-display font-bold text-primary">{vehicle.pricing.exRental}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Lease</div>
                        <div className="font-display font-bold text-primary">{vehicle.pricing.lease}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Link to="/contact">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Enquire Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Fleet?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-card bg-card text-center">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to See Them in Action?
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto mb-8">
            Book a demo at your course or visit one of our partner locations to try before you buy.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              Book A Demo
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}