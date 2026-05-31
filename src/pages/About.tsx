import { motion } from "framer-motion";
import { Leaf, Cpu, Globe, Shield, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { icon: Cpu, value: "50+", label: "Diseases Detected" },
  { icon: Globe, value: "15+", label: "Crop Types" },
  { icon: Users, value: "10K+", label: "Farmers Helped" },
  { icon: Shield, value: "95%", label: "Accuracy Rate" },
];

const About = () => (
  <div className="min-h-screen pt-16">
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Leaf className="w-4 h-4" />
          About Us
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Empowering Farmers with AI
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          AgroLens AI uses advanced machine learning to help farmers detect plant diseases early, reduce crop loss, and increase yield.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="text-center p-6">
              <s.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-2xl font-bold text-card-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-card-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To make AI-powered crop diagnostics accessible to every farmer, enabling smarter decisions and sustainable agriculture worldwide.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </div>
);

export default About;
