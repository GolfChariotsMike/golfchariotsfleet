import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, inquiry_type, message }: ContactEmailRequest = await req.json();

    console.log("Sending contact confirmation email to:", email);

    // Send confirmation email to the customer
    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Golf Chariots <onboarding@resend.dev>",
        to: [email],
        subject: "We received your message!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #1a472a; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Golf Chariots Australia</h1>
                </div>
                <div class="content">
                  <h2>Thank you for contacting us, ${name}!</h2>
                  <p>We have received your ${inquiry_type.replace('_', ' ')} inquiry and will get back to you within 24 hours.</p>
                  <p><strong>Your message:</strong></p>
                  <p style="background: white; padding: 15px; border-left: 3px solid #1a472a;">${message}</p>
                  <p>If you have any urgent questions, please don't hesitate to reach out.</p>
                </div>
                <div class="footer">
                  <p>Golf Chariots Australia | Perth, WA • Sydney, NSW</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const customerResult = await customerEmailResponse.json();
    console.log("Customer email result:", customerResult);

    if (!customerEmailResponse.ok) {
      throw new Error(customerResult.message || "Failed to send customer email");
    }

    // Send notification email to admin
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Golf Chariots Website <onboarding@resend.dev>",
        to: ["info@golfchariots.com.au"],
        subject: `New Contact Form Submission: ${inquiry_type}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body>
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Inquiry Type:</strong> ${inquiry_type}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            </body>
          </html>
        `,
      }),
    });

    const adminResult = await adminEmailResponse.json();
    console.log("Admin notification email result:", adminResult);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
