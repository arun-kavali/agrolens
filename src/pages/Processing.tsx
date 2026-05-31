import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, Search, FileText, CheckCircle2, Leaf, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const steps = [
  { icon: Cpu, label: "Image Processing", duration: 1200 },
  { icon: Search, label: "Disease Detection", duration: 1500 },
  { icon: FileText, label: "Generating Report", duration: 1000 },
];

const Processing = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const img = sessionStorage.getItem("scanImage");
    if (!img) {
      navigate("/scan");
      return;
    }

    let cancelled = false;

    const analyze = async () => {
      try {
        // Step 1: Image Processing
        setCurrentStep(0);
        setProgress(20);
        await new Promise((r) => setTimeout(r, 800));

        if (cancelled) return;

        // Step 2: Disease Detection (actual AI call)
        setCurrentStep(1);
        setProgress(50);

        const { data, error: fnError } = await supabase.functions.invoke("analyze-plant", {
          body: { imageBase64: img },
        });

        if (cancelled) return;

        if (fnError) {
          throw new Error(fnError.message || "Analysis failed");
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        // Step 3: Generating Report
        setCurrentStep(2);
        setProgress(85);
        await new Promise((r) => setTimeout(r, 600));

        if (cancelled) return;

        // Store AI result
        sessionStorage.setItem("analysisResult", JSON.stringify(data));

        setProgress(100);
        await new Promise((r) => setTimeout(r, 400));

        if (!cancelled) {
          navigate("/results/analysis");
        }
      } catch (err: any) {
        console.error("Analysis error:", err);
        if (!cancelled) {
          setError(err.message || "Failed to analyze the image. Please try again.");
          toast.error("Analysis failed. Please try again.");
        }
      }
    };

    const timeout = setTimeout(analyze, 500);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Analysis Failed</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/scan")}>
              Try Again
            </Button>
            <Button
              onClick={() => {
                setError(null);
                setCurrentStep(0);
                setProgress(0);
                // Re-trigger by navigating to self
                navigate("/processing", { replace: true });
                window.location.reload();
              }}
            >
              Retry Analysis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md text-center">
        {/* Scanning animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-40 h-40 mx-auto mb-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full border-2 border-dashed border-primary/20"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl gradient-primary shadow-primary flex items-center justify-center"
            >
              <Leaf className="w-10 h-10 text-primary-foreground" />
            </motion.div>
          </div>
          <motion.div
            animate={{ top: ["5%", "90%", "5%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
            style={{ position: "absolute" }}
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-bold text-foreground mb-2"
        >
          Analyzing plant health...
        </motion.h2>

        <div className="w-full bg-muted rounded-full h-2 mb-8 overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                i < currentStep
                  ? "bg-primary/10 text-primary"
                  : i === currentStep
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {i < currentStep ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : (
                <step.icon className={`w-5 h-5 ${i === currentStep ? "animate-pulse" : ""}`} />
              )}
              <span className="text-sm font-medium">{step.label}</span>
              {i === currentStep && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto text-xs text-muted-foreground"
                >
                  Processing...
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Processing;
