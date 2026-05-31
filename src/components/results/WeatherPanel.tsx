import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CloudRain, Thermometer, Droplets, MapPin, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/languages";
import { supabase } from "@/integrations/supabase/client";

interface WeatherData {
  temp: number;
  humidity: number;
  rain_probability: number;
  location: string;
  description: string;
}

interface Props {
  lang: string;
}

const WeatherPanel = ({ lang }: Props) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Try to get user location
        let lat = 17.385;
        let lon = 78.4867;

        if (navigator.geolocation) {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
            );
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
          } catch {
            // Use default location
          }
        }

        const { data, error } = await supabase.functions.invoke("weather", {
          body: { lat, lon },
        });

        if (error || data?.error) throw new Error(data?.error || error?.message);
        setWeather(data);
      } catch (err) {
        console.error("Weather fetch failed:", err);
        // Fallback mock data
        setWeather({
          temp: 28,
          humidity: 72,
          rain_probability: 45,
          location: "Your Location",
          description: "Partly cloudy",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getRiskLevel = (humidity: number, temp: number) => {
    if (humidity > 80 && temp > 25) return { level: "high", color: "text-destructive", bg: "bg-destructive/10" };
    if (humidity > 60 && temp > 20) return { level: "moderate", color: "text-warning", bg: "bg-warning/10" };
    return { level: "low", color: "text-success", bg: "bg-success/10" };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  const risk = getRiskLevel(weather.humidity, weather.temp);
  const riskLabel = risk.level === "high" ? t(lang, "highRisk") : risk.level === "moderate" ? t(lang, "moderateRisk") : t(lang, "lowRisk");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CloudRain className="w-4 h-4 text-primary" />
            {t(lang, "weather")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {weather.location}
          </div>

          {/* Weather stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-accent rounded-xl p-3 text-center">
              <Thermometer className="w-4 h-4 mx-auto mb-1 text-warning" />
              <p className="text-lg font-bold text-foreground">{weather.temp}°C</p>
              <p className="text-[10px] text-muted-foreground">Temp</p>
            </div>
            <div className="bg-accent rounded-xl p-3 text-center">
              <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold text-foreground">{weather.humidity}%</p>
              <p className="text-[10px] text-muted-foreground">Humidity</p>
            </div>
            <div className="bg-accent rounded-xl p-3 text-center">
              <CloudRain className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              <p className="text-lg font-bold text-foreground">{weather.rain_probability}%</p>
              <p className="text-[10px] text-muted-foreground">Rain</p>
            </div>
          </div>

          {/* Risk indicator */}
          <div className={`flex items-center gap-2 p-3 rounded-xl ${risk.bg}`}>
            {risk.level === "low" ? (
              <ShieldCheck className={`w-5 h-5 ${risk.color}`} />
            ) : (
              <AlertTriangle className={`w-5 h-5 ${risk.color}`} />
            )}
            <div>
              <p className={`text-sm font-semibold ${risk.color}`}>{riskLabel}</p>
              <p className="text-xs text-muted-foreground">{t(lang, "weatherRiskMsg")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeatherPanel;
