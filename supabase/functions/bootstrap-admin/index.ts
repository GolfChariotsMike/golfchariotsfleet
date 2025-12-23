import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TEMPORARY: Allow multiple admin creation - user will disable after setup
    // Check if user with this email already exists
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (existingUser && existingUser.length > 0) {
      return new Response(
        JSON.stringify({ error: "A user with this email already exists." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || "Admin" },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // The trigger should have created the profile and default role
    // Now update the role to admin
    await supabaseAdmin.from("user_roles").delete().eq("user_id", authData.user.id);
    
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: authData.user.id,
      role: "admin",
    });

    if (roleError) {
      console.error("Role error:", roleError);
    }

    console.log("Admin user created successfully:", authData.user.email);

    return new Response(
      JSON.stringify({ success: true, message: "Admin user created successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
