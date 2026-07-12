"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, CheckSquare, Layers, ArrowUpRight, Play, BookOpen, Check, ClipboardList, Sparkles } from "lucide-react";
import Link from "next/link";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import ProgressCard from "@/components/cards/ProgressCard";
import { useAuthStore } from "@/stores/auth.store";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
}

interface LearningTopic {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [recentTimeline, setRecentTimeline] = useState<TimelineEvent[]>([]);
  const [continueTopic, setContinueTopic] = useState<LearningTopic | null>(null);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [weeklyReviewCompleted, setWeeklyReviewCompleted] = useState(false);
  const [showBriefingBanner, setShowBriefingBanner] = useState(false);

  // Focus Timer Elapsed state
  const [elapsedText, setElapsedText] = useState("");

  // Morning briefing visibility trigger
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) {
      setShowBriefingBanner(true);
    }
  }, []);

  // Load Data
  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      try {
        const [tasksRes, projRes, timeRes, learnRes, knowledgeRes] = await Promise.all([
          fetch("/api/tasks", { headers: authHeaders }),
          fetch("/api/projects", { headers: authHeaders }),
          fetch("/api/timeline", { headers: authHeaders }),
          fetch("/api/learning/topics", { headers: authHeaders }),
          fetch("/api/knowledge", { headers: authHeaders }),
        ]);
        const tasksData = await tasksRes.json();
        const projData = await projRes.json();
        const timeData = await timeRes.json();
        const learnData = await learnRes.json();
        const knowledgeData = await knowledgeRes.json();

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
        if (Array.isArray(learnData)) {
          // Find topic currently "In Progress" or default to first topic
          const active = learnData.find((t) => t.status === "In Progress") || learnData[0] || null;
          setContinueTopic(active);
        }
        if (Array.isArray(knowledgeData)) {
          const todayDate = new Date();
          const todayLabel = todayDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const expectedReviewTitle = `Daily Review - ${todayLabel}`;
          const done = knowledgeData.some((item: any) => item.title === expectedReviewTitle);
          setReviewCompleted(done);

          // Check weekly review
          const sevenDaysAgoDate = new Date();
          sevenDaysAgoDate.setDate(todayDate.getDate() - 7);
          const startLabel = sevenDaysAgoDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const endLabel = todayDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          const expectedWeeklyTitle = `Weekly Review - Week of ${startLabel} - ${endLabel}`;
          const weeklyDone = knowledgeData.some((item: any) => item.title === expectedWeeklyTitle);
          setWeeklyReviewCompleted(weeklyDone);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  // Find Current Focus Task (highest priority pending task)
  const priorityOrder: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
  const pendingTasks = tasks.filter((t) => t.status !== "Completed");
  const currentFocusTask = pendingTasks.length > 0
    ? [...pendingTasks].sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0))[0]
    : null;

  // Track Time Elapsed for Focus Task
  useEffect(() => {
    if (!currentFocusTask) {
      setElapsedText("");
      return;
    }
    const updateTimer = () => {
      const diff = Date.now() - new Date(currentFocusTask.createdAt).getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      if (hours > 0) {
        setElapsedText(`${hours}h ${minutes % 60}m elapsed`);
      } else {
        setElapsedText(`${minutes}m elapsed`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [currentFocusTask]);

  // Handlers
  const handleQuickCompleteTask = async (id: string) => {
    try {
      // Optimistic update
      setTasks(tasks.map((t) => (t.id === id ? { ...t, status: "Completed" } : t)));

      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ status: "Completed" }),
      });
      const data = await res.json();
      if (data.id) {
        // Log to timeline
        await fetch("/api/timeline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            type: "Work",
            title: `Completed task: ${data.title}`,
            description: "Completed from Focus Dashboard",
            referenceId: data.id,
            referenceType: "Task",
          }),
        });
      }
    } catch (err) {
      console.error("Failed to complete focus task", err);
    }
  };

  const todoTasksCount = tasks.filter((t) => t.status !== "Completed").length;
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex-1 flex flex-col gap-6 py-4 font-sans">
      {/* Welcome Banner */}
      <div className="flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1.5 min-w-0"
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

        {/* Cute AI Copilot Button */}
        <Link href="/assistant" className="group shrink-0 ml-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 hover:bg-violet-500 hover:text-white transition-all flex items-center justify-center shadow-sm relative cursor-pointer"
            title="Open AI Copilot"
          >
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-400 rounded-full border border-card animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-400 rounded-full border border-card" />
          </motion.div>
        </Link>
      </div>

      {/* Morning Briefing Banner */}
      {showBriefingBanner && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-400 flex justify-between items-center shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-amber-500/10 border-amber-500/25 text-amber-400 animate-pulse shrink-0">
              <Sun className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-foreground">Morning Briefing Ready</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                Prepare your day with quotes, routines, and active subjects.
              </p>
            </div>
          </div>
          <Link
            href="/briefing"
            className="shrink-0 text-xs px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold transition-all cursor-pointer shadow-xs"
          >
            Start
          </Link>
        </motion.div>
      )}

      {/* Daily Review Reminder Panel */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-2xl border transition-all flex justify-between items-center shadow-xs ${
          reviewCompleted
            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
            : "border-pink-500/20 bg-pink-500/5 text-pink-400 hover:bg-pink-500/10"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${
            reviewCompleted 
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              : "bg-pink-500/10 border-pink-500/25 text-pink-400 animate-pulse"
          }`}>
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-foreground">
              {reviewCompleted ? "Daily Review Logged" : "Nightly Reflection Pending"}
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
              {reviewCompleted ? "Great job reflecting on your progress today!" : "Take 1 minute to reflect on your day and set priorities."}
            </p>
          </div>
        </div>
        {!reviewCompleted ? (
          <Link
            href="/review"
            className="shrink-0 text-xs px-3.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-all cursor-pointer shadow-xs"
          >
            Start
          </Link>
        ) : (
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Complete
          </span>
        )}
      </motion.div>

      {/* Weekly Review Reminder Panel */}
      {(() => {
        const currentDay = new Date().getDay();
        const isWeekend = currentDay === 0 || currentDay === 6; // Sunday = 0, Saturday = 6
        const showWeeklyReview = isWeekend || !weeklyReviewCompleted;
        if (!showWeeklyReview) return null;

        return (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border transition-all flex justify-between items-center shadow-xs ${
              weeklyReviewCompleted
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                : "border-violet-500/20 bg-violet-500/5 text-violet-400 hover:bg-violet-500/10"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${
                weeklyReviewCompleted 
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                  : "bg-violet-500/10 border-violet-500/25 text-violet-400 animate-pulse"
              }`}>
                <ClipboardList className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-foreground">
                  {weeklyReviewCompleted ? "Weekly Review Logged" : "Weekly Reflection Pending"}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {weeklyReviewCompleted ? "Great job reflecting on your progress this week!" : "Review your week, track consistency, and prep for what's next."}
                </p>
              </div>
            </div>
            {!weeklyReviewCompleted ? (
              <Link
                href="/review/weekly"
                className="shrink-0 text-xs px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all cursor-pointer shadow-xs"
              >
                Start
              </Link>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Complete
              </span>
            )}
          </motion.div>
        );
      })()}

      {/* Current Focus Panel (Ultra-minimal & Sleek) */}
      {currentFocusTask && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-border bg-card rounded-2xl p-4.5 flex justify-between items-center shadow-xs"
        >
          <div className="min-w-0 flex-1">
            <span className="text-[9px] text-primary font-bold uppercase tracking-widest">
              Current Focus
            </span>
            <h2 className="text-sm font-bold text-foreground truncate mt-1">
              {currentFocusTask.title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
              <span className="font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/10">
                {currentFocusTask.priority}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {elapsedText}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleQuickCompleteTask(currentFocusTask.id)}
            className="w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-all flex items-center justify-center cursor-pointer shrink-0 ml-4 group"
            title="Complete Focus Task"
          >
            <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </motion.div>
      )}

      {/* Metrics Grid */}
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

      {/* Today's Progress Section */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 border-b border-border/40 pb-2">
          Today's Progress
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProgressCard
            label="Tasks Completed"
            completed={completedTasksCount}
            total={tasks.length || 1}
            color="bg-primary"
          />
          <ProgressCard
            label="Active Projects"
            completed={projectsCount > 0 ? 1 : 0}
            total={projectsCount || 1}
            color="bg-blue-500"
          />
        </div>
      </div>

      {/* Continue Learning Widget */}
      {continueTopic && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-4 flex justify-between items-center shadow-sm"
        >
          <div className="min-w-0">
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Continue Learning
            </span>
            <h4 className="text-xs font-bold text-foreground mt-1.5 truncate">
              {continueTopic.title}
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {continueTopic.category} • {continueTopic.progress}% complete
            </p>
          </div>
          <Link
            href="/learning"
            className="shrink-0 text-xs px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all font-semibold cursor-pointer"
          >
            Resume
          </Link>
        </motion.div>
      )}

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
