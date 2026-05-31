import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanLine, Eye, Pill, Activity, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ScanLine,
    title: "Disease Detection",
    desc: "AI identifies crop diseases from leaf images",
  },
  {
    icon: Eye,
    title: "Infection Visualization",
    desc: "Highlights infected areas on the leaf",
  },
  {
    icon: Pill,
    title: "Treatment Plans",
    desc: "Provides medicines and solutions",
  },
  {
    icon: Activity,
    title: "Health Monitoring",
    desc: "Track plant health over time",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-background" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />

        <div className="container mx-auto relative z-10 px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                AI-Powered Agriculture
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-foreground mb-6">
                AI Plant Disease{" "}
                <span className="text-gradient">Detection</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Upload a leaf photo and get instant crop health insights
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/scan">
                  <Button size="lg" className="gradient-primary shadow-primary gap-2 text-primary-foreground border-0">
                    <ScanLine className="w-5 h-5" />
                    Start Scan
                  </Button>
                </Link>
                <Link to="/results/demo">
                  <Button size="lg" variant="outline" className="gap-2">
                    View Demo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right - Animated Leaf Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                {/* Glow rings */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-primary/20"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute inset-4 rounded-full border-2 border-primary/15"
                />
                {/* Central leaf icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 md:w-52 md:h-52 rounded-3xl gradient-primary shadow-primary flex items-center justify-center">
                    <Leaf className="w-20 h-20 md:w-28 md:h-28 text-primary-foreground" />
                  </div>
                </div>
                {/* Scanning line */}
                <motion.div
                  animate={{ top: ["10%", "80%", "10%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                  style={{ position: "absolute" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-14"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl md:text-4xl font-bold text-foreground mb-3"
            >
              How It Works
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground">
              Smart diagnosis in seconds
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i + 2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group bg-card rounded-2xl p-6 border shadow-card hover:shadow-primary transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl gradient-primary p-12 md:p-16 text-center shadow-primary"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to protect your crops?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
              Start scanning your plants today
            </p>
            <Link to="/scan">
              <Button size="lg" variant="secondary" className="gap-2 font-semibold">
                <ScanLine className="w-5 h-5" />
                Start Free Scan
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            AgroLens AI © 2026
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/guide" className="hover:text-foreground transition-colors">Plant Guide</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
