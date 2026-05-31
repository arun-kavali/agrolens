export interface CropDisease {
  name: string;
  description: string;
  symptoms: string;
  prevention: string;
}

export interface Crop {
  name: string;
  icon: string;
  category: "vegetable" | "fruit" | "grain";
  diseases: CropDisease[];
}

export const crops: Crop[] = [
  {
    name: "Tomato", icon: "🍅", category: "vegetable",
    diseases: [
      { name: "Early Blight", description: "Fungal disease causing dark spots on leaves.", symptoms: "Dark concentric rings on lower leaves, yellowing.", prevention: "Crop rotation, remove infected debris, use resistant varieties." },
      { name: "Leaf Curl Virus", description: "Viral disease spread by whiteflies.", symptoms: "Upward curling of leaves, stunted growth.", prevention: "Control whiteflies, use virus-free seedlings." },
      { name: "Late Blight", description: "Aggressive fungal disease causing rapid decay.", symptoms: "Water-soaked lesions, white mold on leaves.", prevention: "Avoid overhead watering, apply copper fungicide." },
    ],
  },
  {
    name: "Potato", icon: "🥔", category: "vegetable",
    diseases: [
      { name: "Late Blight", description: "Destroys foliage and tubers rapidly.", symptoms: "Dark water-soaked spots, white mold underneath.", prevention: "Use certified seed, apply fungicide before rains." },
      { name: "Black Scurf", description: "Fungal disease affecting tuber skin.", symptoms: "Black lumps on tuber surface, poor emergence.", prevention: "Crop rotation, plant in warm soil." },
      { name: "Common Scab", description: "Bacterial disease causing rough patches.", symptoms: "Raised corky lesions on tubers.", prevention: "Maintain soil pH below 5.5, irrigate consistently." },
    ],
  },
  {
    name: "Rice", icon: "🌾", category: "grain",
    diseases: [
      { name: "Blast", description: "Most destructive rice disease worldwide.", symptoms: "Diamond-shaped lesions on leaves, neck rot.", prevention: "Use resistant varieties, balanced nitrogen fertilization." },
      { name: "Bacterial Leaf Blight", description: "Bacterial infection causing leaf wilting.", symptoms: "Water-soaked stripes, leaf edges turn yellow.", prevention: "Use disease-free seeds, avoid excess nitrogen." },
      { name: "Sheath Blight", description: "Fungal disease affecting stems and leaves.", symptoms: "Oval greenish-gray lesions on leaf sheaths.", prevention: "Reduce plant density, apply fungicide." },
    ],
  },
  {
    name: "Wheat", icon: "🌿", category: "grain",
    diseases: [
      { name: "Rust", description: "Fungal disease causing orange-brown pustules.", symptoms: "Orange-brown spots on leaves and stems.", prevention: "Plant resistant varieties, timely sowing." },
      { name: "Powdery Mildew", description: "White powdery coating on leaves.", symptoms: "White powder on leaves, reduced photosynthesis.", prevention: "Apply sulfur fungicide, avoid excess nitrogen." },
      { name: "Loose Smut", description: "Seed-borne disease replacing grain with spores.", symptoms: "Black powdery mass instead of grain.", prevention: "Treat seeds with fungicide before planting." },
    ],
  },
  {
    name: "Maize", icon: "🌽", category: "grain",
    diseases: [
      { name: "Northern Leaf Blight", description: "Fungal disease causing long gray-green lesions.", symptoms: "Cigar-shaped gray-green lesions on leaves.", prevention: "Use resistant hybrids, practice crop rotation." },
      { name: "Stalk Rot", description: "Attacks stalks causing lodging.", symptoms: "Soft discolored stalks, plant falls over.", prevention: "Avoid plant stress, balanced fertilization." },
      { name: "Ear Rot", description: "Fungal infection of corn ears.", symptoms: "Moldy kernels, discolored husks.", prevention: "Harvest at proper moisture, store dry." },
    ],
  },
  {
    name: "Cotton", icon: "☁️", category: "grain",
    diseases: [
      { name: "Bacterial Blight", description: "Angular water-soaked spots on leaves.", symptoms: "Angular lesions, black arm on stems.", prevention: "Use resistant varieties, acid-delinted seeds." },
      { name: "Fusarium Wilt", description: "Soil-borne fungal disease causing wilting.", symptoms: "Yellowing leaves, brown vascular tissue.", prevention: "Crop rotation, use resistant varieties." },
      { name: "Leaf Curl Virus", description: "Spread by whiteflies, causes leaf distortion.", symptoms: "Downward curling, thickened veins.", prevention: "Control whiteflies, remove infected plants." },
    ],
  },
  {
    name: "Sugarcane", icon: "🎋", category: "grain",
    diseases: [
      { name: "Red Rot", description: "Most serious sugarcane disease.", symptoms: "Red discoloration of internal tissue, white patches.", prevention: "Use resistant varieties, treat seed canes." },
      { name: "Smut", description: "Black whip-like growth from the top.", symptoms: "Black whip emerging from shoot, stunted growth.", prevention: "Use disease-free setts, hot water treatment." },
      { name: "Wilt", description: "Gradual drying of leaves from top.", symptoms: "Yellowing and drying of leaves, hollow stalks.", prevention: "Proper drainage, use healthy planting material." },
    ],
  },
  {
    name: "Soybean", icon: "🫘", category: "grain",
    diseases: [
      { name: "Rust", description: "Fungal disease causing reddish-brown spots.", symptoms: "Small reddish-brown pustules on leaves.", prevention: "Plant early maturing varieties, apply fungicide." },
      { name: "Yellow Mosaic", description: "Viral disease causing yellow patches.", symptoms: "Bright yellow patches on leaves, reduced pods.", prevention: "Control whiteflies, use resistant varieties." },
      { name: "Root Rot", description: "Soil-borne fungal disease.", symptoms: "Brown roots, wilting plants, poor growth.", prevention: "Improve drainage, seed treatment." },
    ],
  },
  {
    name: "Chili", icon: "🌶️", category: "vegetable",
    diseases: [
      { name: "Anthracnose", description: "Causes dark sunken spots on fruits.", symptoms: "Dark sunken spots, fruit rot.", prevention: "Avoid overhead irrigation, use treated seeds." },
      { name: "Leaf Curl", description: "Viral disease causing leaf distortion.", symptoms: "Curled leaves, stunted plants.", prevention: "Control thrips and mites, use resistant varieties." },
      { name: "Powdery Mildew", description: "White powder on leaf surface.", symptoms: "White powdery spots, leaf drop.", prevention: "Apply sulfur spray, improve ventilation." },
    ],
  },
  {
    name: "Onion", icon: "🧅", category: "vegetable",
    diseases: [
      { name: "Purple Blotch", description: "Fungal disease causing purple lesions.", symptoms: "Purple elongated spots on leaves, bulb rot.", prevention: "Crop rotation, spray mancozeb." },
      { name: "Downy Mildew", description: "Fungal infection in cool wet conditions.", symptoms: "Pale green patches, violet-gray fungal growth.", prevention: "Good drainage, fungicide application." },
      { name: "Basal Rot", description: "Soil-borne fungal disease.", symptoms: "Yellowing from tip, soft bulb base.", prevention: "Avoid waterlogging, use treated sets." },
    ],
  },
  {
    name: "Garlic", icon: "🧄", category: "vegetable",
    diseases: [
      { name: "White Rot", description: "Serious soil-borne fungal disease.", symptoms: "Yellow leaves, white fluffy mold at base.", prevention: "Long crop rotation (8+ years), use clean seed." },
      { name: "Rust", description: "Orange pustules on leaves.", symptoms: "Orange-brown spots on leaves.", prevention: "Apply fungicide, avoid excess nitrogen." },
      { name: "Purple Blotch", description: "Purple spots on leaves.", symptoms: "Purple sunken spots, leaf dieback.", prevention: "Spray mancozeb, improve air circulation." },
    ],
  },
  {
    name: "Brinjal", icon: "🍆", category: "vegetable",
    diseases: [
      { name: "Fruit Rot", description: "Fungal disease causing fruit decay.", symptoms: "Water-soaked spots, soft rotten fruit.", prevention: "Remove infected fruits, apply copper spray." },
      { name: "Little Leaf", description: "Phytoplasma disease causing small leaves.", symptoms: "Very small leaves, excessive branching.", prevention: "Control leafhoppers, remove infected plants." },
      { name: "Bacterial Wilt", description: "Soil-borne bacterial disease.", symptoms: "Sudden wilting without yellowing.", prevention: "Crop rotation, use resistant varieties." },
    ],
  },
  {
    name: "Cabbage", icon: "🥬", category: "vegetable",
    diseases: [
      { name: "Black Rot", description: "Bacterial disease causing V-shaped lesions.", symptoms: "V-shaped yellow areas at leaf edges.", prevention: "Use disease-free seeds, crop rotation." },
      { name: "Clubroot", description: "Soil-borne disease causing root swelling.", symptoms: "Swollen distorted roots, wilting.", prevention: "Lime soil to raise pH, long rotation." },
      { name: "Downy Mildew", description: "Fungal disease on undersides of leaves.", symptoms: "Yellow patches, gray mold underneath.", prevention: "Good air circulation, fungicide sprays." },
    ],
  },
  {
    name: "Cauliflower", icon: "🥦", category: "vegetable",
    diseases: [
      { name: "Black Rot", description: "Bacterial disease causing leaf decay.", symptoms: "V-shaped yellow lesions, black veins.", prevention: "Hot water seed treatment, rotation." },
      { name: "Downy Mildew", description: "White-gray growth on leaf undersides.", symptoms: "Yellow spots on top, mold underneath.", prevention: "Avoid overhead watering, fungicide." },
      { name: "Alternaria Leaf Spot", description: "Dark spot disease on leaves.", symptoms: "Dark concentric spots on leaves.", prevention: "Remove debris, apply mancozeb." },
    ],
  },
  {
    name: "Groundnut", icon: "🥜", category: "grain",
    diseases: [
      { name: "Tikka Disease", description: "Leaf spot disease causing defoliation.", symptoms: "Circular dark spots on leaves, leaf drop.", prevention: "Spray mancozeb, use resistant varieties." },
      { name: "Rust", description: "Orange pustules on leaf undersides.", symptoms: "Orange-brown spots, premature defoliation.", prevention: "Early sowing, fungicide application." },
      { name: "Collar Rot", description: "Soil-borne fungal disease.", symptoms: "Rotting at soil level, wilting.", prevention: "Seed treatment, avoid waterlogging." },
    ],
  },
  {
    name: "Mango", icon: "🥭", category: "fruit",
    diseases: [
      { name: "Anthracnose", description: "Most important mango disease.", symptoms: "Black spots on flowers and fruits, blossom blight.", prevention: "Pre-bloom copper spray, harvest at right stage." },
      { name: "Powdery Mildew", description: "White powder on flowers and leaves.", symptoms: "White coating on panicles, flower drop.", prevention: "Spray sulfur fungicide at flowering." },
      { name: "Bacterial Canker", description: "Causes canker on stems and fruits.", symptoms: "Raised lesions, gum exudation.", prevention: "Prune infected branches, copper spray." },
    ],
  },
  {
    name: "Banana", icon: "🍌", category: "fruit",
    diseases: [
      { name: "Panama Disease", description: "Devastating soil-borne fungal wilt.", symptoms: "Yellowing leaves, splitting pseudostem.", prevention: "Use resistant varieties, avoid infected soil." },
      { name: "Sigatoka Leaf Spot", description: "Fungal disease reducing leaf area.", symptoms: "Yellow streaks becoming brown spots.", prevention: "Remove affected leaves, apply fungicide." },
      { name: "Bunchy Top Virus", description: "Viral disease causing stunted plants.", symptoms: "Narrow bunched leaves, dark green streaks.", prevention: "Use virus-free suckers, control aphids." },
    ],
  },
];
