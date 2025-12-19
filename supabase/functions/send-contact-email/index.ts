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
  phone?: string;
  inquiry_type: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, inquiry_type, message }: ContactEmailRequest = await req.json();

    console.log("Sending contact form notification to admin");

    // Send notification email to admin only
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Golf Chariots Website <onboarding@resend.dev>",
        to: ["info@golfchariots.com.au"],
        subject: `New Contact Form: ${inquiry_type} from ${name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #1a472a; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #1a472a; }
                .message-box { background: white; padding: 15px; border-left: 3px solid #1a472a; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New Contact Form Submission</h1>
                </div>
                <div class="content">
                  <div class="field">
                    <span class="label">Name:</span> ${name}
                  </div>
                  <div class="field">
                    <span class="label">Email:</span> <a href="mailto:${email}">${email}</a>
                  </div>
                  ${phone ? `<div class="field"><span class="label">Phone:</span> ${phone}</div>` : ''}
                  <div class="field">
                    <span class="label">Inquiry Type:</span> ${inquiry_type.replace('_', ' ')}
                  </div>
                  <div class="field">
                    <span class="label">Message:</span>
                    <div class="message-box">${message}</div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const adminResult = await adminEmailResponse.json();
    console.log("Admin notification email result:", adminResult);

    if (!adminEmailResponse.ok) {
      throw new Error(adminResult.message || "Failed to send notification email");
    }

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
