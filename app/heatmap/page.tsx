"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Briefcase, Dumbbell, BookOpen, ClipboardList, Flame, Calendar, RefreshCw } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { useAuthStore } from "@/stores/auth.store";

interface HeatmapData {
  Work: Record<string, number>;
  Gym: Record<string, number>;
  Teaching: Record<string, number>;
  Learning: Record<string, number>;
  Mind: Record<string, number>;
}

export default function HeatmapPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HeatmapData>({
    Work: {},
    Gym: {},
    Teaching: {},
    Learning: {},
    Mind: {},
  });

  const [streak, setStreak] = useState(0);
  const [weeklyLogsCount, setWeeklyLogsCount] = useState(0);

  const timezone = typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";

  // Date utilities
  const getLocalDateString = (dateVal: Date, tz: string) => {
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(new Date(dateVal));
    } catch (e) {
      return new Date(dateVal).toISOString().split("T")[0];
    }
  };

  // Re-generate list of last 112 days (16 weeks) aligned to starts-on-Sunday
  const getHeatmapDays = () => {
    const days = [];
    const today = new Date();
    const end = new Date(today);
    
    const start = new Date(today);
    start.setDate(today.getDate() - 111);
    
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);
    
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const days = getHeatmapDays();

  // Load heatmap statistics
  async function fetchHeatmap() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/heatmap?timezone=${encodeURIComponent(timezone)}`, {
        headers: authHeaders,
      });
      const heatmapData = await res.json();
      if (heatmapData && !heatmapData.error) {
        setData(heatmapData);
        calculateStats(heatmapData);
      }
    } catch (err) {
      console.error("Failed to load heatmap data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHeatmap();
  }, [user]);

  const calculateStats = (heatmapData: HeatmapData) => {
    const dailyTotals: Record<string, number> = {};
    Object.values(heatmapData).forEach((catMap: any) => {
      Object.entries(catMap).forEach(([dateStr, count]: any) => {
        dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + count;
      });
    });

    // 1. Current Streak (backward from today)
    let currentStreak = 0;
    const testDate = new Date();
    let keepChecking = true;

    while (keepChecking) {
      const dateStr = getLocalDateString(testDate, timezone);
      if (dailyTotals[dateStr] && dailyTotals[dateStr] > 0) {
        currentStreak++;
        testDate.setDate(testDate.getDate() - 1);
      } else {
        // If 0 logs today, verify yesterday before breaking (might not have logged today yet)
        if (currentStreak === 0) {
          testDate.setDate(testDate.getDate() - 1);
          const yesterdayStr = getLocalDateString(testDate, timezone);
          if (dailyTotals[yesterdayStr] && dailyTotals[yesterdayStr] > 0) {
            currentStreak++;
            testDate.setDate(testDate.getDate() - 1);
            continue;
          }
        }
        keepChecking = false;
      }
    }

    // 2. Weekly Log Count (last 7 days)
    let weeklyCount = 0;
    const weekTest = new Date();
    for (let i = 0; i < 7; i++) {
      const dateStr = getLocalDateString(weekTest, timezone);
      weeklyCount += dailyTotals[dateStr] || 0;
      weekTest.setDate(weekTest.getDate() - 1);
    }

    setStreak(currentStreak);
    setWeeklyLogsCount(weeklyCount);
  };

  // Helper to determine intensity level class
  const getIntensityClass = (count: number, category: keyof HeatmapData) => {
    if (!count || count === 0) return "bg-zinc-900 border-border/10";
    
    switch (category) {
      case "Work":
        if (count === 1) return "bg-blue-950/40 text-blue-400 border-blue-500/20";
        if (count === 2) return "bg-blue-800/60 text-blue-300 border-blue-400/25";
        return "bg-blue-600 text-white border-blue-300/35";
      case "Gym":
        if (count === 1) return "bg-orange-950/40 text-orange-400 border-orange-500/20";
        if (count === 2) return "bg-orange-700/60 text-orange-300 border-orange-400/25";
        return "bg-orange-500 text-white border-orange-300/35";
      case "Teaching":
        if (count === 1) return "bg-emerald-950/40 text-emerald-400 border-emerald-500/20";
        if (count === 2) return "bg-emerald-700/60 text-emerald-300 border-emerald-400/25";
        return "bg-emerald-500 text-white border-emerald-300/35";
      case "Learning":
        if (count === 1) return "bg-pink-950/40 text-pink-400 border-pink-500/20";
        if (count === 2) return "bg-pink-700/60 text-pink-300 border-pink-400/25";
        return "bg-pink-500 text-white border-pink-300/35";
      case "Mind":
        if (count === 1) return "bg-violet-950/40 text-violet-400 border-violet-500/20";
        if (count === 2) return "bg-violet-750/60 text-violet-300 border-violet-400/25";
        return "bg-violet-600 text-white border-violet-300/35";
    }
  };

  const categoriesList = [
    { key: "Work" as keyof HeatmapData, label: "Work & Productivity", icon: Briefcase, color: "text-blue-400", unit: "tasks" },
    { key: "Gym" as keyof HeatmapData, label: "Gym Workouts", icon: Dumbbell, color: "text-orange-400", unit: "workouts" },
    { key: "Teaching" as keyof HeatmapData, label: "Tuition Lessons", icon: BookOpen, color: "text-emerald-400", unit: "lessons" },
    { key: "Learning" as keyof HeatmapData, label: "Learning Notes", icon: ClipboardList, color: "text-pink-400", unit: "topics" },
    { key: "Mind" as keyof HeatmapData, label: "Mind Reflections", icon: Brain, color: "text-violet-400", unit: "reflections" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4">
        <PageHeader
          title="Life Heatmap"
          description="Visualize your consistency across key areas."
          icon={Calendar}
          iconColor="text-violet-500"
        />
        <LoadingSkeleton variant="card" count={3} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <PageHeader
          title="Life Heatmap"
          description="Track your consistency across Work, Gym, Teaching, Learning, and Reflections over the last 16 weeks."
          icon={Calendar}
          iconColor="text-violet-500"
        />
        <button
          onClick={fetchHeatmap}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer"
          title="Refresh Statistics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Overview Stats Widget */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 shrink-0">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Current Streak</span>
            <p className="text-base font-extrabold text-foreground">{streak} Days</p>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Logs This Week</span>
            <p className="text-base font-extrabold text-foreground">{weeklyLogsCount} Logs</p>
          </div>
        </div>
      </div>

      {/* Heatmaps Stack */}
      <div className="flex flex-col gap-6">
        {categoriesList.map(({ key, label, icon: Icon, color, unit }) => {
          const categoryLogs = data[key];
          
          return (
            <div key={key} className="flex flex-col gap-2.5">
              {/* Category Label */}
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs font-bold text-foreground">{label}</span>
              </div>

              {/* Heatmap Grid Wrapper */}
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2 shadow-sm overflow-x-auto scrollbar-thin">
                <div className="grid grid-rows-7 grid-flow-col gap-1 min-w-[340px] justify-between">
                  {days.map((day, dIdx) => {
                    const dateStr = getLocalDateString(day, timezone);
                    const count = categoryLogs[dateStr] || 0;
                    
                    const formattedDate = day.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <div
                        key={dIdx}
                        className={`group relative w-3.5 h-3.5 rounded-sm border cursor-pointer transition-all hover:scale-125 ${getIntensityClass(
                          count,
                          key
                        )}`}
                      >
                        {/* CSS Tooltip */}
                        <div className="hidden group-hover:block absolute bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#09090B] border border-border px-2 py-1 rounded-md shadow-2xl text-[9px] font-bold text-foreground whitespace-nowrap pointer-events-none">
                          {count} {unit} on {formattedDate}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex justify-between items-center text-[9px] text-muted-foreground font-semibold uppercase tracking-wider pt-2 border-t border-border/40 mt-1">
                  <span>16 Weeks Ago</span>
                  <div className="flex items-center gap-1">
                    <span>Less</span>
                    <div className="w-2.5 h-2.5 rounded bg-zinc-900 border border-border/10" />
                    <div className={`w-2.5 h-2.5 rounded border ${getIntensityClass(1, key)}`} />
                    <div className={`w-2.5 h-2.5 rounded border ${getIntensityClass(2, key)}`} />
                    <div className={`w-2.5 h-2.5 rounded border ${getIntensityClass(3, key)}`} />
                    <span>More</span>
                  </div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
