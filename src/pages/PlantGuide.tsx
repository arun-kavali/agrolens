import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, Search, Thermometer, Droplets, CloudRain,
  ChevronDown, ChevronUp, ShieldCheck, AlertTriangle, Bug,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/languages";
import { crops, type Crop } from "@/data/cropData";

const PlantGuide = () => {
  const { lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);
  const [categoryTab, setCategoryTab] = useState("all");
  const [riskInputs, setRiskInputs] = useState({ crop: "", temp: "", humidity: "", rainfall: "" });
  const [riskResult, setRiskResult] = useState<string | null>(null);

  const filteredCrops = crops.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryTab === "all" ||
      (categoryTab === "vegetables" && c.category === "vegetable") ||
      (categoryTab === "fruits" && c.category === "fruit") ||
      (categoryTab === "grains" && c.category === "grain");
    return matchesSearch && matchesCategory;
  });

  const toggleCrop = (name: string) => {
    setExpandedCrop(expandedCrop === name ? null : name);
  };

  const calculateRisk = () => {
    const temp = parseFloat(riskInputs.temp);
    const humidity = parseFloat(riskInputs.humidity);
    if (humidity > 80 || temp > 35) setRiskResult("High");
    else if (humidity > 60 || temp > 28) setRiskResult("Medium");
    else setRiskResult("Low");
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            {t(lang, "plantGuide")}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{t(lang, "cropEncyclopedia")}</h1>
          <p className="text-muted-foreground text-sm">{t(lang, "browsecrops")}</p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t(lang, "searchCrops")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={categoryTab} onValueChange={setCategoryTab} className="mb-8">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all">{t(lang, "allCrops")}</TabsTrigger>
            <TabsTrigger value="vegetables">{t(lang, "vegetables")}</TabsTrigger>
            <TabsTrigger value="fruits">{t(lang, "fruits")}</TabsTrigger>
            <TabsTrigger value="grains">{t(lang, "grains")}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Crop Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filteredCrops.map((crop, i) => (
            <motion.div
              key={crop.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className="cursor-pointer hover:shadow-card transition-all"
                onClick={() => toggleCrop(crop.name)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{crop.icon}</span>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{crop.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {crop.diseases.length} {t(lang, "knownDiseases")}
                        </p>
                      </div>
                    </div>
                    {expandedCrop === crop.name ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Expanded disease details */}
                  <AnimatePresence>
                    {expandedCrop === crop.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3 border-t pt-4">
                          <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5">
                            <Bug className="w-3.5 h-3.5" />
                            {t(lang, "commonDiseases")}
                          </h4>
                          {crop.diseases.map((d) => (
                            <div key={d.name} className="bg-accent rounded-lg p-3 space-y-1.5">
                              <p className="text-sm font-semibold text-card-foreground">{d.name}</p>
                              <p className="text-xs text-muted-foreground">{d.description}</p>
                              <div className="flex items-start gap-1.5 mt-1">
                                <AlertTriangle className="w-3 h-3 text-warning mt-0.5 shrink-0" />
                                <p className="text-[11px] text-muted-foreground">
                                  <span className="font-medium text-foreground">{t(lang, "symptoms")}:</span> {d.symptoms}
                                </p>
                              </div>
                              <div className="flex items-start gap-1.5">
                                <ShieldCheck className="w-3 h-3 text-success mt-0.5 shrink-0" />
                                <p className="text-[11px] text-muted-foreground">
                                  <span className="font-medium text-foreground">{t(lang, "prevention")}:</span> {d.prevention}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredCrops.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Leaf className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No crops found matching "{search}"</p>
          </div>
        )}

        {/* Weather Risk Predictor */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CloudRain className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-card-foreground">{t(lang, "weatherRiskPredictor")}</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Select onValueChange={(v) => setRiskInputs((p) => ({ ...p, crop: v }))}>
                  <SelectTrigger><SelectValue placeholder={t(lang, "cropType")} /></SelectTrigger>
                  <SelectContent>
                    {crops.map((c) => (
                      <SelectItem key={c.name} value={c.name}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input
                    placeholder="Temperature °C"
                    type="number"
                    value={riskInputs.temp}
                    onChange={(e) => setRiskInputs((p) => ({ ...p, temp: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input
                    placeholder="Humidity %"
                    type="number"
                    value={riskInputs.humidity}
                    onChange={(e) => setRiskInputs((p) => ({ ...p, humidity: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input
                    placeholder="Rainfall mm"
                    type="number"
                    value={riskInputs.rainfall}
                    onChange={(e) => setRiskInputs((p) => ({ ...p, rainfall: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={calculateRisk} className="gradient-primary text-primary-foreground border-0 gap-2">
                {t(lang, "predictRisk")}
              </Button>
              {riskResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-4 p-4 rounded-xl text-center font-bold text-lg ${
                    riskResult === "High"
                      ? "bg-destructive/10 text-destructive"
                      : riskResult === "Medium"
                      ? "bg-warning/10 text-warning"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {t(lang, "diseaseRisk")}: {riskResult === "High" ? t(lang, "highRisk") : riskResult === "Medium" ? t(lang, "moderateRisk") : t(lang, "lowRisk")}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PlantGuide;
