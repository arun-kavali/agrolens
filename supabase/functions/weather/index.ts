import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();
    const apiKey = Deno.env.get("OPENWEATHER_API_KEY");

    if (!apiKey) {
      throw new Error("OPENWEATHER_API_KEY is not configured");
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenWeather API error:", response.status, errText);
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    const result = {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      rain_probability: data.clouds?.all || 0,
      location: data.name || "Unknown",
      description: data.weather?.[0]?.description || "N/A",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Weather function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
