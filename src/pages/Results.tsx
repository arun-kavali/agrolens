import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf, AlertTriangle, Droplets, Bug, Wind,
  ShieldCheck, Scissors, SprayCan, Waves,
  Download, Eye, EyeOff, ZoomIn,
  Sprout, TestTube, Skull, ExternalLink, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import HealthGauge from "@/components/HealthGauge";
import DiseaseDescription from "@/components/results/DiseaseDescription";
import WeatherPanel from "@/components/results/WeatherPanel";
import VoiceAssistant from "@/components/results/VoiceAssistant";
import CostEstimator from "@/components/results/CostEstimator";
import NearbyShops from "@/components/results/NearbyShops";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/languages";
import { generatePdfReport } from "@/lib/generatePdf";
import { toast } from "sonner";

// Static color class map so Tailwind JIT can detect these classes
const causeColorClasses: Record<string, string> = {
  destructive: "text-destructive",
  primary: "text-primary",
  warning: "text-warning",
  "muted-foreground": "text-muted-foreground",
};

// Icon mapping for causes
const causeIcons: Record<string, any> = {
  destructive: Bug,
  primary: Droplets,
  warning: Sprout,
  "muted-foreground": Skull,
};

// Icons for treatment steps
const treatmentIcons = [Scissors, SprayCan, Wind, Waves];
const preventionIcons = [Droplets, Sprout, TestTube, ShieldCheck];

interface AnalysisResult {
  isHealthy: boolean;
  diseaseName: string;
  confidence: number;
  healthScore: number;
  severity: string;
  affectedArea: number;
  description: string;
  causes: { label: string; color: string }[];
  treatments: { step: number; label: string; explanation: string }[];
  medicines: { name: string; purpose: string; price: string }[];
  preventions: string[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const Results = () => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const scanImage = sessionStorage.getItem("scanImage");

  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {
        navigate("/scan");
      }
    } else {
      navigate("/scan");
    }
  }, [navigate]);

  if (!result) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-muted-foreground">Loading results...</div>
      </div>
    );
  }

  const getHealthLabel = () => {
    const s = result.healthScore;
    if (s >= 80) return t(lang, "healthy");
    if (s >= 60) return t(lang, "mildInfection");
    if (s >= 40) return t(lang, "moderateInfection");
    return t(lang, "severeInfection");
  };

  const getHealthColor = () => {
    const s = result.healthScore;
    if (s >= 80) return "text-primary";
    if (s >= 60) return "text-warning";
    if (s >= 40) return "text-warning";
    return "text-destructive";
  };

  const adviceText = result.treatments
    .map((tr) => `${tr.label}. ${tr.explanation}`)
    .join(". ");

  const handleDownloadPdf = async () => {
    try {
      await generatePdfReport({
        diseaseName: result.diseaseName,
        confidence: result.confidence,
        healthScore: result.healthScore,
        severity: result.severity,
        affectedArea: result.affectedArea,
        description: result.description,
        treatments: result.treatments,
        medicines: result.medicines.map((m) => ({
          ...m,
          amazonUrl: `https://www.amazon.in/s?k=${encodeURIComponent(m.name)}`,
          flipkartUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(m.name)}`,
        })),
        preventions: result.preventions,
        scanImage: scanImage || undefined,
      });
      toast.success("PDF report downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{t(lang, "analysisResults")}</h1>
          <p className="text-muted-foreground text-sm">{t(lang, "detailedReport")}</p>
        </motion.div>

        {/* Healthy plant banner */}
        {result.isHealthy && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Your plant looks healthy! 🌿</p>
              <p className="text-sm text-muted-foreground">No diseases detected. Keep up the good care!</p>
            </div>
          </motion.div>
        )}

        {/* Top Section: Image + Disease Card + Weather */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Left: Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-muted flex items-center justify-center">
                {scanImage ? (
                  <img src={scanImage} alt="Scanned leaf" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-accent flex items-center justify-center">
                    <Leaf className="w-20 h-20 text-primary/30" />
                  </div>
                )}
                {showHeatmap && !result.isHealthy && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[20%] left-[30%] w-[35%] h-[40%] rounded-full bg-destructive/25 blur-xl" />
                    <div className="absolute top-[40%] right-[20%] w-[20%] h-[25%] rounded-full bg-warning/25 blur-xl" />
                    <div className="absolute bottom-[15%] left-[15%] w-[25%] h-[20%] rounded-full bg-success/20 blur-lg" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {!result.isHealthy ? (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span className="text-muted-foreground">Infected</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-warning" />
                        <span className="text-muted-foreground">Early</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-success" />
                        <span className="text-muted-foreground">Healthy</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-primary font-medium">Healthy Plant</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    {!result.isHealthy && (
                      <div className="flex items-center gap-2 text-sm">
                        {showHeatmap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                      </div>
                    )}
                    <Button variant="ghost" size="icon">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voice Assistant */}
            <VoiceAssistant lang={lang} adviceText={adviceText} />
          </motion.div>

          {/* Right: Disease + Health + Weather */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Disease Result */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {result.isHealthy ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  )}
                  {result.isHealthy ? "Plant Status" : t(lang, "diseaseDetected")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold text-foreground mb-2">{result.diseaseName}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-muted-foreground">{t(lang, "confidence")}</span>
                  <div className="flex-1">
                    <Progress value={result.confidence} className="h-2" />
                  </div>
                  <span className="text-sm font-semibold text-primary">{result.confidence}%</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-accent rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t(lang, "severity")}</p>
                    <p className={`text-lg font-bold ${result.isHealthy ? "text-primary" : "text-warning"}`}>
                      {result.severity}
                    </p>
                  </div>
                  <div className="bg-accent rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{t(lang, "affectedArea")}</p>
                    <p className={`text-lg font-bold ${result.isHealthy ? "text-primary" : "text-destructive"}`}>
                      {result.affectedArea}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Score */}
            <Card>
              <CardContent className="p-6 flex items-center gap-6">
                <HealthGauge score={result.healthScore} />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t(lang, "healthScore")}</p>
                  <p className="text-3xl font-bold text-foreground">{result.healthScore}</p>
                  <p className={`text-sm font-medium ${getHealthColor()}`}>{getHealthLabel()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Disease Description */}
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">{result.description}</p>
              </CardContent>
            </Card>

            {/* Weather */}
            <WeatherPanel lang={lang} />
          </motion.div>
        </div>

        {/* Tabs - only show relevant ones */}
        <Tabs defaultValue={result.isHealthy ? "prevention" : "treatment"} className="mb-8">
          <div className="w-full overflow-x-auto -mx-1 px-1 mb-2">
            <TabsList className="inline-flex w-max min-w-full sm:w-full sm:max-w-2xl sm:grid sm:gap-1 sm:auto-cols-fr sm:grid-flow-col">
              {!result.isHealthy && <TabsTrigger value="causes" className="text-xs sm:text-sm whitespace-nowrap">{t(lang, "causes")}</TabsTrigger>}
              {!result.isHealthy && <TabsTrigger value="treatment" className="text-xs sm:text-sm whitespace-nowrap">{t(lang, "treatment")}</TabsTrigger>}
              {!result.isHealthy && <TabsTrigger value="medicine" className="text-xs sm:text-sm whitespace-nowrap">{t(lang, "medicine")}</TabsTrigger>}
              <TabsTrigger value="prevention" className="text-xs sm:text-sm whitespace-nowrap">{t(lang, "prevention")}</TabsTrigger>
              {!result.isHealthy && <TabsTrigger value="cost" className="text-xs sm:text-sm whitespace-nowrap">{t(lang, "costEstimator")}</TabsTrigger>}
            </TabsList>
          </div>

          {/* Causes */}
          {!result.isHealthy && (
            <TabsContent value="causes" className="mt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.causes.map((c, i) => {
                  const Icon = causeIcons[c.color] || Bug;
                  return (
                    <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                      <Card className="text-center p-6 hover:shadow-card transition-shadow">
                        <Icon className={`w-10 h-10 mx-auto mb-3 ${causeColorClasses[c.color] || "text-primary"}`} />
                        <p className="text-sm font-medium text-card-foreground">{c.label}</p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          )}

          {/* Treatment */}
          {!result.isHealthy && (
            <TabsContent value="treatment" className="mt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {result.treatments.map((tr, i) => {
                  const Icon = treatmentIcons[i % treatmentIcons.length];
                  return (
                    <motion.div key={tr.step} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                      <Card className="p-6 hover:shadow-card transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                            {tr.step}
                          </div>
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-card-foreground mb-2">{tr.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{tr.explanation}</p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          )}

          {/* Medicine */}
          {!result.isHealthy && (
            <TabsContent value="medicine" className="mt-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {result.medicines.map((m, i) => (
                  <motion.div key={m.name} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <Card className="p-6 hover:shadow-card transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-3">
                        <SprayCan className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-card-foreground mb-1">{m.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{m.purpose}</p>
                      <p className="text-sm font-bold text-primary mb-3">{m.price}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs gap-1"
                          onClick={() => window.open(`https://www.amazon.in/s?k=${encodeURIComponent(m.name)}`, "_blank", "noopener,noreferrer")}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Amazon
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs gap-1"
                          onClick={() => window.open(`https://www.flipkart.com/search?q=${encodeURIComponent(m.name)}`, "_blank", "noopener,noreferrer")}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Flipkart
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Prevention */}
          <TabsContent value="prevention" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(result.preventions || [])
                .map((tip: any) => {
                  if (!tip) return "";
                  if (typeof tip === "string") return tip;
                  return tip.label || tip.title || tip.text || tip.description || tip.tip || "";
                })
                .filter((tip: string) => tip.trim().length > 0)
                .map((tip: string, i: number) => {
                  const Icon = preventionIcons[i % preventionIcons.length];
                  return (
                    <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                      <Card className="text-center p-6 hover:shadow-card transition-shadow h-full flex flex-col items-center justify-start">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-card-foreground leading-relaxed break-words">{tip}</p>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </TabsContent>


          {/* Cost Estimator */}
          {!result.isHealthy && (
            <TabsContent value="cost" className="mt-6">
              <div className="max-w-md">
                <CostEstimator lang={lang} />
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Nearby Shops */}
        {!result.isHealthy && (
          <NearbyShops lang={lang} medicines={result.medicines} />
        )}

        {/* Download PDF */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center gap-3"
        >
          <Button onClick={handleDownloadPdf} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t(lang, "downloadPdf")}
          </Button>
          <Button variant="outline" onClick={() => navigate("/scan")} className="gap-2">
            <Leaf className="w-4 h-4" />
            Scan Another
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
