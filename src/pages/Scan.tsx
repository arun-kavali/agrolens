import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Image, X, ScanLine, Sun, Focus, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const tips = [
  { icon: Image, text: "Clear leaf image" },
  { icon: Sun, text: "Good lighting" },
  { icon: Focus, text: "Focus on affected area" },
];

const Scan = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyze = () => {
    if (preview) {
      // Store in sessionStorage for results page
      sessionStorage.setItem("scanImage", preview);
      navigate("/processing");
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            Plant Scanner
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Scan Plant Leaf
          </h1>
          <p className="text-muted-foreground">Upload or capture a leaf image for analysis</p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <motion.div
                  animate={{ y: isDragging ? -8 : 0 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-primary">
                    <Upload className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-1">
                    {isDragging ? "Drop your image here" : "Drag & drop leaf image"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">JPG, PNG supported</p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={(e) => e.stopPropagation()}>
                      <Camera className="w-4 h-4" />
                      Camera
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-card rounded-2xl border overflow-hidden shadow-card"
              >
                <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={preview}
                    alt="Leaf preview"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3"
                    onClick={() => { setPreview(null); setFileName(""); }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">{fileName}</span>
                  <Button
                    onClick={handleAnalyze}
                    className="gradient-primary shadow-primary gap-2 text-primary-foreground border-0"
                  >
                    <ScanLine className="w-4 h-4" />
                    Analyze Leaf
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-6 mt-8"
        >
          {tips.map((tip) => (
            <div key={tip.text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <tip.icon className="w-4 h-4 text-primary" />
              {tip.text}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Scan;
