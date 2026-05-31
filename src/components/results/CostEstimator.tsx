import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/lib/languages";

interface CostBreakdown {
  fungicide: number;
  nutrients: number;
  pesticides: number;
  total: number;
}

interface Props {
  lang: string;
}

const cropTypes = ["Tomato", "Potato", "Rice", "Wheat", "Cotton", "Sugarcane", "Maize"];

// Average cost per acre in INR
const baseCosts: Record<string, { fungicide: number; nutrients: number; pesticides: number }> = {
  Tomato: { fungicide: 800, nutrients: 600, pesticides: 500 },
  Potato: { fungicide: 750, nutrients: 550, pesticides: 450 },
  Rice: { fungicide: 600, nutrients: 700, pesticides: 400 },
  Wheat: { fungicide: 500, nutrients: 650, pesticides: 350 },
  Cotton: { fungicide: 900, nutrients: 700, pesticides: 600 },
  Sugarcane: { fungicide: 700, nutrients: 800, pesticides: 500 },
  Maize: { fungicide: 550, nutrients: 600, pesticides: 400 },
};

const CostEstimator = ({ lang }: Props) => {
  const [farmSize, setFarmSize] = useState("");
  const [cropType, setCropType] = useState("");
  const [cost, setCost] = useState<CostBreakdown | null>(null);

  const handleEstimate = () => {
    const acres = parseFloat(farmSize);
    if (!acres || !cropType) return;

    const base = baseCosts[cropType] || baseCosts.Tomato;
    const breakdown: CostBreakdown = {
      fungicide: Math.round(base.fungicide * acres),
      nutrients: Math.round(base.nutrients * acres),
      pesticides: Math.round(base.pesticides * acres),
      total: 0,
    };
    breakdown.total = breakdown.fungicide + breakdown.nutrients + breakdown.pesticides;
    setCost(breakdown);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="w-4 h-4 text-primary" />
            {t(lang, "costEstimator")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{t(lang, "farmSize")}</label>
              <Input
                type="number"
                placeholder="e.g. 5"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                min="0.1"
                step="0.5"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{t(lang, "cropType")}</label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleEstimate} className="w-full gradient-primary text-primary-foreground border-0 gap-2">
            <Calculator className="w-4 h-4" />
            {t(lang, "estimateCost")}
          </Button>

          {cost && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
              <div className="space-y-2">
                {[
                  { label: t(lang, "fungicide"), value: cost.fungicide },
                  { label: t(lang, "nutrients"), value: cost.nutrients },
                  { label: t(lang, "pesticides"), value: cost.pesticides },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground flex items-center gap-0.5">
                      <IndianRupee className="w-3 h-3" />
                      {item.value.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="font-semibold text-foreground">{t(lang, "totalCost")}</span>
                <span className="text-lg font-bold text-primary flex items-center gap-0.5">
                  <IndianRupee className="w-4 h-4" />
                  {cost.total.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">{t(lang, "costNote")}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CostEstimator;
