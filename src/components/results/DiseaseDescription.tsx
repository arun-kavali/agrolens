import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/languages";

interface Props {
  lang: string;
  diseaseName: string;
}

const DiseaseDescription = ({ lang, diseaseName }: Props) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="w-4 h-4 text-primary" />
            {t(lang, "description")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(lang, "diseaseDescription")}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DiseaseDescription;
