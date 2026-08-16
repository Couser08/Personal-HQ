// Supabase Edge Function: Gemini API Secure Proxy
// Proxies generative AI calls to Google AI Studio with CORS & server-side API key protection.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-gemini-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serverKey = Deno.env.get("GEMINI_API_KEY");
    const clientKey = req.headers.get("x-gemini-key");
    const apiKey = serverKey || clientKey;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: "No Gemini API key configured. Provide GEMINI_API_KEY on the server or via client settings." } }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { model = "gemini-2.5-flash", action = "generateContent", payload } = await req.json();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}?key=${apiKey.trim()}`;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await geminiRes.json();
    return new Response(JSON.stringify(data), {
      status: geminiRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: { message: err.message || "Internal Proxy Error" } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
