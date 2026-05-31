import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const systemPrompt = `You are an expert plant pathologist and agricultural scientist. Analyze the provided plant/leaf image carefully.

Your task:
1. Determine if the plant/leaf is HEALTHY or DISEASED.
2. If healthy, respond with healthy status.
3. If diseased, identify the disease precisely.

You MUST respond with ONLY valid JSON in this exact format, no other text:

For a HEALTHY plant:
{
  "isHealthy": true,
  "diseaseName": "Healthy Plant",
  "confidence": 95,
  "healthScore": 92,
  "severity": "None",
  "affectedArea": 0,
  "description": "The plant appears healthy with no visible signs of disease, pest damage, or nutrient deficiency.",
  "causes": [],
  "treatments": [],
  "medicines": [],
  "preventions": ["Maintain proper watering schedule", "Ensure adequate sunlight", "Use balanced fertilizer", "Regular plant inspection"]
}

For a DISEASED plant:
{
  "isHealthy": false,
  "diseaseName": "Disease Name Here",
  "confidence": 85,
  "healthScore": 45,
  "severity": "Moderate",
  "affectedArea": 30,
  "description": "Detailed description of the disease...",
  "causes": [
    {"label": "Cause 1", "color": "destructive"},
    {"label": "Cause 2", "color": "primary"},
    {"label": "Cause 3", "color": "warning"},
    {"label": "Cause 4", "color": "muted-foreground"}
  ],
  "treatments": [
    {"step": 1, "label": "Treatment step 1", "explanation": "Detailed explanation of step 1"},
    {"step": 2, "label": "Treatment step 2", "explanation": "Detailed explanation of step 2"},
    {"step": 3, "label": "Treatment step 3", "explanation": "Detailed explanation of step 3"},
    {"step": 4, "label": "Treatment step 4", "explanation": "Detailed explanation of step 4"}
  ],
  "medicines": [
    {"name": "Medicine 1", "purpose": "Purpose description", "price": "₹200 – ₹400"},
    {"name": "Medicine 2", "purpose": "Purpose description", "price": "₹150 – ₹350"},
    {"name": "Medicine 3", "purpose": "Purpose description", "price": "₹250 – ₹500"}
  ],
  "preventions": ["Prevention tip 1", "Prevention tip 2", "Prevention tip 3", "Prevention tip 4"]
}

IMPORTANT RULES:
- confidence should reflect how certain you are (0-100)
- healthScore: 80-100 for healthy, 60-79 mild, 40-59 moderate, 0-39 severe
- severity: "None", "Mild", "Moderate", or "Severe"
- affectedArea: percentage of visible leaf/plant affected (0-100)
- Be accurate. If the leaf looks completely healthy with good color and no spots/lesions, mark it as healthy.
- If you cannot determine it's a plant image, still return a response with isHealthy: true and a note in description.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this plant/leaf image. Is it healthy or diseased? Respond with ONLY the JSON object.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      // Try to find raw JSON
      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonStr = braceMatch[0];
      }
    }

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      // Return a safe fallback
      result = {
        isHealthy: true,
        diseaseName: "Analysis Inconclusive",
        confidence: 50,
        healthScore: 70,
        severity: "None",
        affectedArea: 0,
        description: "Could not determine the plant health with certainty. Please try with a clearer image.",
        causes: [],
        treatments: [],
        medicines: [],
        preventions: ["Take a clearer photo", "Ensure good lighting", "Focus on affected areas", "Try again with a different angle"],
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-plant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
