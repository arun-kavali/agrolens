import { motion } from "framer-motion";
import { Calendar, Leaf, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import HealthGauge from "@/components/HealthGauge";

const scans = [
  { date: "Mar 8, 2026", plant: "Tomato", disease: "Early Blight", score: 58 },
  { date: "Mar 5, 2026", plant: "Potato", disease: "Late Blight", score: 42 },
  { date: "Mar 1, 2026", plant: "Tomato", disease: "Healthy", score: 92 },
  { date: "Feb 25, 2026", plant: "Rice", disease: "Blast", score: 35 },
  { date: "Feb 20, 2026", plant: "Wheat", disease: "Healthy", score: 88 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const History = () => {
  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Activity className="w-4 h-4" />
            Scan History
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Your Scans</h1>
          <p className="text-muted-foreground text-sm">Track plant health over time</p>
        </motion.div>

        {/* Health trend placeholder */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-card-foreground">Health Trend</h3>
              </div>
              <div className="h-32 flex items-end gap-3">
                {scans.slice().reverse().map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${s.score}%` }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className="flex-1 rounded-t-lg gradient-primary relative group cursor-pointer"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {s.score}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-3 mt-2">
                {scans.slice().reverse().map((s, i) => (
                  <div key={i} className="flex-1 text-center text-[10px] text-muted-foreground truncate">
                    {s.date.slice(0, 6)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-4">
          {scans.map((scan, i) => (
            <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className="hover:shadow-card transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <HealthGauge score={scan.score} size={56} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Leaf className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-card-foreground">{scan.plant}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{scan.disease}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {scan.date}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
