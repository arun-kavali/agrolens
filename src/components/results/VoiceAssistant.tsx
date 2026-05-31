import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Volume2, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { t, languages } from "@/lib/languages";
import { toast } from "sonner";

interface Props {
  lang: string;
  adviceText: string;
}

const VoiceAssistant = ({ lang, adviceText }: Props) => {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");

  const langConfig = languages.find((l) => l.code === lang) || languages[0];

  // Clean advice text: remove numbering, bullets, and symbols for natural speech
  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/^\d+[\.\)\-\:]\s*/gm, "") // remove "1. ", "2) ", "3- ", "4: "
      .replace(/^[\•\-\*\►\▸\→]\s*/gm, "") // remove bullet chars
      .replace(/\s{2,}/g, " ") // collapse whitespace
      .trim();
  };

  const handleListenAdvice = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const cleanedText = cleanTextForSpeech(adviceText);

    const speakWithVoice = () => {
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = langConfig.speechCode;
      utterance.rate = 0.9;

      // Find a voice matching the selected language
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = langConfig.speechCode.split("-")[0];
      const matchingVoice =
        voices.find((v) => v.lang === langConfig.speechCode) ||
        voices.find((v) => v.lang.startsWith(langPrefix));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    };

    // Voices may load asynchronously
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speakWithVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      speakWithVoice();
    }
  }, [adviceText, langConfig]);

  const handleAskByVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = langConfig.speechCode;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      toast.error("Could not recognize speech. Please try again.");
    };
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setTimeout(() => handleListenAdvice(), 500);
    };

    recognition.start();
  }, [langConfig, handleListenAdvice]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Button
              variant={listening ? "destructive" : "outline"}
              className="flex-1 gap-2"
              onClick={listening ? () => setListening(false) : handleAskByVoice}
            >
              {listening ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t(lang, "listeningVoice")}
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  {t(lang, "voiceAsk")}
                </>
              )}
            </Button>
            <Button
              variant={speaking ? "destructive" : "outline"}
              className="flex-1 gap-2"
              onClick={speaking ? stopSpeaking : handleListenAdvice}
            >
              {speaking ? (
                <>
                  <MicOff className="w-4 h-4" />
                  {t(lang, "stopVoice")}
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  {t(lang, "voiceListen")}
                </>
              )}
            </Button>
          </div>
          {transcript && (
            <div className="bg-accent rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">{t(lang, "youSaid")}</p>
              <p className="text-sm text-foreground">{transcript}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VoiceAssistant;
