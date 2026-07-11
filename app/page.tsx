"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, CheckSquare, Layers, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { useAuthStore } from "@/stores/auth.store";

interface Task {
  id: string;
  title: string;
  status: string;
}

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [recentTimeline, setRecentTimeline] = useState<TimelineEvent[]>([]);

  // Load Data
  useEffect(() => {
    async function loadDashboard() {
      try {
        const [tasksRes, projRes, timeRes] = await Promise.all([
          fetch("/api/tasks", { headers: authHeaders }),
          fetch("/api/projects", { headers: authHeaders }),
          fetch("/api/timeline", { headers: authHeaders }),
        ]);
        const tasksData = await tasksRes.json();
        const projData = await projRes.json();
        const timeData = await timeRes.json();

        if (Array.isArray(tasksData)) setTasks(tasksData);
        if (Array.isArray(projData)) setProjectsCount(projData.length);
        if (Array.isArray(timeData)) {
          setRecentTimeline(
            timeData.slice(0, 3).map((e: any) => {
              const dt = new Date(e.createdAt);
              const timeString = dt.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return {
                id: e.id,
                type: e.type,
                title: e.title,
                description: e.description,
                time: timeString,
              };
            })
          );
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  const todoTasksCount = tasks.filter((t) => t.status !== "Completed").length;
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex-1 flex flex-col gap-8 py-6 font-sans">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1.5"
      >
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
          {formattedDate}
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Welcome, Atif.
        </h1>
        <p className="text-xs text-muted-foreground">
          Your personal operating system is synchronized and running smoothly.
        </p>
      </motion.div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Todo Tasks", value: todoTasksCount, icon: CheckSquare, color: "text-purple-400", href: "/work?tab=tasks" },
          { label: "Active Projects", value: projectsCount, icon: Layers, color: "text-blue-400", href: "/work?tab=projects" },
          { label: "Done Today", value: completedTasksCount, icon: Calendar, color: "text-emerald-400", href: "/work?tab=tasks" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link key={idx} href={item.href} className="flex flex-1 w-full">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="w-full bg-card border border-border rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:scale-[1.02] hover:border-primary/35 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <span className="text-xl font-bold text-foreground">{item.value}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Today's Schedule & Recent Activity side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col gap-3.5"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Today's Schedule
            </h3>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            {[
              { time: "09:30", label: "BrandsWay Development", type: "Work", active: true },
              { time: "17:00", label: "Chest & Triceps Workout", type: "Gym", active: false },
              { time: "19:00", label: "Mathematics Tuition", type: "Teaching", active: false },
              { time: "21:00", label: "Read AI Research Paper", type: "Learning", active: false },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">
                  {item.time}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground">{item.type}</div>
                </div>
                {item.active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3.5"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Recent Logs
            </h3>
            <Link
              href="/timeline"
              className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
            >
              Timeline <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {loading ? (
              <LoadingSkeleton variant="list" count={2} />
            ) : recentTimeline.length > 0 ? (
              recentTimeline.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-xl p-3.5 flex justify-between items-center shadow-xs"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-[9px] px-2 py-0.5 rounded-full border border-border text-muted-foreground font-semibold uppercase tracking-wider bg-background/50">
                      {item.type}
                    </span>
                    <div className="text-xs font-bold text-foreground truncate mt-2">
                      {item.title}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-border bg-card rounded-2xl text-xs text-muted-foreground p-4">
                No recent timeline logs recorded.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
