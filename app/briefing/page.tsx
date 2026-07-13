"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sun, CloudSun, Calendar, CheckSquare, Award, Clock, ArrowRight, Play, Compass, FileText, Check, Quote } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { useAuthStore } from "@/stores/auth.store";

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
}

interface LearningTopic {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: string;
}

interface ScheduleItem {
  time: string;
  label: string;
  type: string;
}

const STOIC_QUOTES = [
  { text: "When you arise in the morning, think of what a precious privilege it is to be alive - to breathe, to think, to enjoy, to love.", author: "Marcus Aurelius" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "Begin at once to live, and count each separate day as a separate life.", author: "Seneca" },
  { text: "If a man knows not to which port he sails, no wind is favorable.", author: "Seneca" },
  { text: "Don't explain your philosophy. Embody it.", author: "Epictetus" },
];

export default function MorningBriefingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  const [loading, setLoading] = useState(true);
  const [priorityTask, setPriorityTask] = useState<Task | null>(null);
  const [continueTopic, setContinueTopic] = useState<LearningTopic | null>(null);
  const [quote, setQuote] = useState(STOIC_QUOTES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState({
    temp: "28°C",
    condition: "Partly Cloudy",
    location: "Aligarh, IN",
  });

  const today = new Date();
  const localDayOfWeek = today.getDay();
  
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const getTodaySchedule = (dayIndex: number): ScheduleItem[] => {
    switch (dayIndex) {
      case 1: // Monday
        return [
          { time: "09:30", label: "BrandsWay Development", type: "Work" },
          { time: "17:00", label: "Chest & Triceps Workout", type: "Gym" },
          { time: "19:00", label: "Mathematics Tuition", type: "Teaching" },
          { time: "21:00", label: "Read AI Research Paper", type: "Learning" },
        ];
      case 2: // Tuesday
        return [
          { time: "09:30", label: "BrandsWay Development", type: "Work" },
          { time: "17:00", label: "Cardio & Core Session", type: "Gym" },
          { time: "19:30", label: "Computer Science Lesson", type: "Teaching" },
          { time: "21:00", label: "React Core Architecture Study", type: "Learning" },
        ];
      case 3: // Wednesday
        return [
          { time: "09:30", label: "BrandsWay Development", type: "Work" },
          { time: "17:00", label: "Back & Biceps Workout", type: "Gym" },
          { time: "19:00", label: "Mathematics Tuition", type: "Teaching" },
          { time: "21:00", label: "Read AI Research Paper", type: "Learning" },
        ];
      case 4: // Thursday
        return [
          { time: "09:30", label: "BrandsWay Development", type: "Work" },
          { time: "17:00", label: "Legs & Shoulders Workout", type: "Gym" },
          { time: "19:30", label: "Computer Science Lesson", type: "Teaching" },
          { time: "21:00", label: "Rust Programming Language Practice", type: "Learning" },
        ];
      case 5: // Friday
        return [
          { time: "09:30", label: "BrandsWay Development", type: "Work" },
          { time: "17:00", label: "Active Recovery & Yoga", type: "Gym" },
          { time: "19:00", label: "Mathematics Tuition", type: "Teaching" },
          { time: "21:00", label: "Deep Learning & RAG Exploration", type: "Learning" },
        ];
      default: // Saturday & Sunday
        return [
          { time: "10:00", label: "Weekly Planning & Admin", type: "Work" },
          { time: "11:30", label: "Outdoor Cardio Session", type: "Gym" },
          { time: "15:00", label: "Second Brain Review & Clean Up", type: "Mind" },
          { time: "17:00", label: "Free Reading & Reflection", type: "Learning" },
        ];
    }
  };

  const todaySchedule = getTodaySchedule(localDayOfWeek);

  useEffect(() => {
    async function loadBriefingData() {
      if (!user) return;
      try {
        // Choose quote randomly
        const randQ = STOIC_QUOTES[Math.floor(Math.random() * STOIC_QUOTES.length)];
        setQuote(randQ);

        // Fetch local weather dynamically if geolocation is available
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;
              try {
                // Fetch current weather from Open-Meteo
                const weatherRes = await fetch(
                  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
                );
                const weatherData = await weatherRes.json();
                const tempVal = Math.round(weatherData.current.temperature_2m);
                const code = weatherData.current.weather_code;

                let cond = "Clear Sky";
                if (code >= 1 && code <= 3) cond = "Partly Cloudy";
                else if (code >= 45 && code <= 48) cond = "Foggy";
                else if (code >= 51 && code <= 67) cond = "Rainy";
                else if (code >= 71 && code <= 77) cond = "Snowy";
                else if (code >= 80 && code <= 82) cond = "Showers";
                else if (code >= 95 && code <= 99) cond = "Thunderstorm";

                // Reverse geocode to get city name
                let loc = "Aligarh, IN";
                try {
                  const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
                    { headers: { "Accept-Language": "en" } }
                  );
                  const geoData = await geoRes.json();
                  const address = geoData.address;
                  const city = address.city || address.town || address.village || address.suburb || "Aligarh";
                  const countryCode = address.country_code ? address.country_code.toUpperCase() : "IN";
                  loc = `${city}, ${countryCode}`;
                } catch (geoErr) {
                  console.error("Geocoding failed", geoErr);
                }

                setWeatherInfo({
                  temp: `${tempVal}°C`,
                  condition: cond,
                  location: loc,
                });
              } catch (err) {
                console.error("Weather fetch failed", err);
              }
            },
            (err) => {
              console.error("Geolocation failed", err);
            }
          );
        }

        // Fetch Tasks and Learning Topics
        const [tasksRes, learnRes] = await Promise.all([
          fetch("/api/tasks", { headers: authHeaders }),
          fetch("/api/learning/topics", { headers: authHeaders }),
        ]);

        const tasksData = await tasksRes.json();
        const learnData = await learnRes.json();

        // Find priority pending task
        if (Array.isArray(tasksData)) {
          const priorityOrder: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
          const pending = tasksData.filter((t: any) => t.status !== "Completed");
          if (pending.length > 0) {
            const sorted = [...pending].sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
            setPriorityTask(sorted[0]);
          }
        }

        // Find "In Progress" learning topic
        if (Array.isArray(learnData)) {
          const active = learnData.find((t: any) => t.status === "Learning") || learnData[0] || null;
          setContinueTopic(active);
        }
      } catch (err) {
        console.error("Failed to load morning briefing data", err);
      } finally {
        setLoading(false);
      }
    }
    loadBriefingData();
  }, [user]);

  const handleStartDay = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/timeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          type: "Mind",
          title: "Completed Morning Briefing",
          description: `Initialized routine on ${dateString}`,
        }),
      });
      router.push("/");
    } catch (err) {
      console.error(err);
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4">
        <PageHeader
          title="Morning Briefing"
          description="Synthesizing today's schedule, quote of the day, and top priorities..."
          icon={Sun}
          iconColor="text-amber-500"
        />
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <PageHeader
          title="Morning Briefing"
          description={dateString}
          icon={Sun}
          iconColor="text-amber-400 animate-spin-slow"
        />
      </div>

      {/* Stoic Quote Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-card flex flex-col gap-4 shadow-sm relative overflow-hidden"
      >
        <div className="absolute right-4 bottom-4 opacity-5 text-violet-400">
          <Quote className="w-24 h-24" />
        </div>
        <div className="flex items-center gap-2 text-violet-400">
          <Compass className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Morning Reflection</span>
        </div>
        <p className="text-sm italic text-foreground/90 font-medium leading-relaxed">
          "{quote.text}"
        </p>
        <span className="text-xs font-bold text-muted-foreground self-end">
          — {quote.author}
        </span>
      </motion.div>

      {/* Main Grid: Weather + Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather & Date Card */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 border border-border bg-card rounded-2xl flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Weather Outlook</span>
              <h4 className="text-sm font-bold text-foreground mt-0.5">{weatherInfo.condition}, {weatherInfo.temp}</h4>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-semibold border border-border">
            {weatherInfo.location}
          </span>
        </motion.div>

        {/* Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3.5"
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 pl-1">
            <Clock className="w-3.5 h-3.5" />
            Today's Schedule
          </h3>
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            {todaySchedule.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">
                  {item.time}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground">{item.type}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Focus & Learning Cards side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Priority Task */}
        {priorityTask && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3.5"
          >
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 pl-1">
              <CheckSquare className="w-3.5 h-3.5" />
              Top Work Priority
            </h3>
            <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="min-w-0 flex-1 pr-4">
                <h4 className="text-xs font-extrabold text-primary uppercase tracking-widest">
                  {priorityTask.priority} priority
                </h4>
                <p className="text-sm font-bold text-foreground mt-1 truncate">
                  {priorityTask.title}
                </p>
              </div>
              <button
                onClick={() => router.push("/work")}
                className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer font-bold"
              >
                Focus
              </button>
            </div>
          </motion.div>
        )}

        {/* Continue Learning */}
        {continueTopic && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3.5"
          >
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 pl-1">
              <Award className="w-3.5 h-3.5" />
              Continue Subject
            </h3>
            <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="min-w-0 flex-1 pr-4">
                <span className="text-[9px] text-pink-400 font-bold uppercase tracking-widest">
                  {continueTopic.category}
                </span>
                <p className="text-sm font-bold text-foreground mt-1 truncate">
                  {continueTopic.title}
                </p>
                <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-pink-500"
                    style={{ width: `${continueTopic.progress}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => router.push("/learning")}
                className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500 hover:text-white transition-all cursor-pointer font-bold"
              >
                Resume
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Start My Day Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={handleStartDay}
        disabled={submitting}
        className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-500/10 mt-2"
      >
        {submitting ? "Initializing OS..." : "Start My Day"} <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
