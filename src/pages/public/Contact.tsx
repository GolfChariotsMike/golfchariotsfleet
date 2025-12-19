import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().optional(),
  inquiry_type: z.string().min(1, "Please select an inquiry type"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const inquiryTypes = [
  { value: "quote", label: "Request a Quote" },
  { value: "leasing", label: "Leasing Inquiry" },
  { value: "demo", label: "Book a Demo" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "support", label: "Support / Service" },
  { value: "general", label: "General Inquiry" },
];

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "info@golfchariots.com.au",
    href: "mailto:info@golfchariots.com.au",
  },
  {
    icon: MapPin,
    title: "Locations",
    value: "Perth, WA • Sydney, NSW",
    href: null,
  },
  {
    icon: Clock,
    title: "Hours",
    value: "Mon-Fri 8am-5pm",
    href: null,
  },
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      inquiry_type: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          inquiry_type: data.inquiry_type,
          message: data.message,
        });

      if (error) throw error;

      // Send confirmation emails via edge function
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: data.name,
          email: data.email,
          inquiry_type: data.inquiry_type,
          message: data.message,
        },
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Don't throw - form submission succeeded, just email failed
      }

      setIsSubmitted(true);
      toast.success("Message sent successfully! We'll be in touch soon.");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to send message. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Get In Touch
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl">
              Have questions about our golf scooters? Want a quote for your course? 
              We'd love to hear from you. Get in touch and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Contact Information
              </h2>
              <div className="space-y-6 mb-8">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{item.title}</div>
                      {item.href ? (
                        <a 
                          href={item.href} 
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <div className="text-muted-foreground">{item.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Card className="bg-primary text-primary-foreground border-0">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-lg mb-3">
                    Looking for a Quote?
                  </h3>
                  <p className="text-primary-foreground/70 text-sm mb-4">
                    Fill out the form with your requirements and we'll get back to you 
                    with a customized quote within 24 hours.
                  </p>
                  <div className="text-accent font-semibold">
                    Fast Response Guaranteed
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-hero border-0">
                <CardContent className="p-8">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-status-available/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-status-available" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                        Thank You!
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Your message has been received. Our team will review your inquiry 
                        and get back to you within 24 hours.
                      </p>
                      <Button 
                        onClick={() => {
                          setIsSubmitted(false);
                          form.reset();
                        }}
                        variant="outline"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                        Send us a Message
                      </h2>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Smith" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email Address *</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="john@golfclub.com.au" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid sm:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input type="tel" placeholder="0400 000 000" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="inquiry_type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Inquiry Type *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select inquiry type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {inquiryTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message *</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us about your course and what you're looking for..."
                                    className="min-h-[150px] resize-none"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            size="lg" 
                            className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              "Sending..."
                            ) : (
                              <>
                                Send Message
                                <Send className="ml-2 w-4 h-4" />
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (placeholder) */}
      <section className="bg-secondary">
        <div className="container-wide section-padding">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Based in Perth & Sydney, Serving All of Australia
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We work with golf courses across Western Australia, New South Wales, 
              and beyond. Delivery and setup available nationwide.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}