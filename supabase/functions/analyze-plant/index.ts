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

    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const systemPrompt = `You are an expert plant pathologist and agricultural scientist with strong visual recognition skills.

Your job is to inspect the image and respond with ONLY a valid JSON object — no markdown, no commentary.

STEP 1 — Determine if the image actually shows a plant, leaf, flower, fruit, vegetable, crop, tree, or any plant part.

If the image is NOT a plant (e.g. person, animal, food dish, vehicle, object, landscape with no clear plant focus, blank/blurry image), respond with:
{
  "isPlant": false,
  "isHealthy": false,
  "detectedObject": "<short name of what you actually see, e.g. 'Dog', 'Smartphone', 'Plate of Pasta', 'Car', 'Human face'>",
  "diseaseName": "Not a Plant",
  "confidence": <0-100 — how sure you are about what the object is>,
  "healthScore": 0,
  "severity": "N/A",
  "affectedArea": 0,
  "description": "This image does not appear to contain a plant. It looks like a <detectedObject>. Please upload a clear photo of a plant or leaf for analysis.",
  "causes": [],
  "treatments": [],
  "medicines": [],
  "preventions": []
}

STEP 2 — If it IS a plant, decide HEALTHY or DISEASED.

For a HEALTHY plant:
{
  "isPlant": true,
  "isHealthy": true,
  "detectedObject": "<plant or leaf type if identifiable, else 'Plant'>",
  "diseaseName": "Healthy Plant",
  "confidence": 95,
  "healthScore": 92,
  "severity": "None",
  "affectedArea": 0,
  "description": "Detailed description of why the plant looks healthy — leaf color, structure, absence of spots/lesions/pests, etc.",
  "causes": [],
  "treatments": [],
  "medicines": [],
  "preventions": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]
}

For a DISEASED plant:
{
  "isPlant": true,
  "isHealthy": false,
  "detectedObject": "<plant/crop type, e.g. 'Tomato leaf'>",
  "diseaseName": "<exact disease name>",
  "confidence": 85,
  "healthScore": 45,
  "severity": "Mild|Moderate|Severe",
  "affectedArea": 30,
  "description": "Detailed description of the disease and visible symptoms.",
  "causes": [
    {"label": "Cause 1", "color": "destructive"},
    {"label": "Cause 2", "color": "primary"},
    {"label": "Cause 3", "color": "warning"},
    {"label": "Cause 4", "color": "muted-foreground"}
  ],
  "treatments": [
    {"step": 1, "label": "Step 1", "explanation": "Detailed explanation"},
    {"step": 2, "label": "Step 2", "explanation": "Detailed explanation"},
    {"step": 3, "label": "Step 3", "explanation": "Detailed explanation"},
    {"step": 4, "label": "Step 4", "explanation": "Detailed explanation"}
  ],
  "medicines": [
    {"name": "Medicine 1", "purpose": "Purpose", "price": "₹200 – ₹400"},
    {"name": "Medicine 2", "purpose": "Purpose", "price": "₹150 – ₹350"},
    {"name": "Medicine 3", "purpose": "Purpose", "price": "₹250 – ₹500"}
  ],
  "preventions": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]
}

RULES:
- confidence: 0-100
- healthScore: 80-100 healthy, 60-79 mild, 40-59 moderate, 0-39 severe
- Be accurate. Do NOT call something a plant if it isn't.
- Always include the "isPlant" field.
- Respond with ONLY the JSON object, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this image. First decide if it is a plant. Respond with ONLY the JSON object." },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      const braceMatch = content.match(/\{[\s\S]*\}/);
      if (braceMatch) jsonStr = braceMatch[0];
    }

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      result = {
        isPlant: false,
        isHealthy: false,
        detectedObject: "Unknown",
        diseaseName: "Analysis Inconclusive",
        confidence: 50,
        healthScore: 0,
        severity: "N/A",
        affectedArea: 0,
        description: "Could not analyze this image. Please try with a clearer photo of a plant or leaf.",
        causes: [],
        treatments: [],
        medicines: [],
        preventions: [],
      };
    }

    // Normalize defaults
    if (typeof result.isPlant === "undefined") result.isPlant = true;
    result.causes = result.causes || [];
    result.treatments = result.treatments || [];
    result.medicines = result.medicines || [];
    result.preventions = result.preventions || [];

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-plant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
