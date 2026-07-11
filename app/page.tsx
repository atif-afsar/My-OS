"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Clock, CheckCircle } from "lucide-react";
import ProgressCard from "@/components/cards/ProgressCard";
import TimelineCard from "@/components/cards/TimelineCard";
import SectionHeader from "@/components/common/SectionHeader";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

interface Task {
  id: string;
  title: string;
  status: string;
}

interface Project {
  id: string;
  title: string;
}

interface TimelineEvent {
  id: string;
  type: "Work" | "Teaching" | "Learning" | "Gym" | "Mind" | "General";
  title: string;
  description: string;
  time: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  // States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [recentTimeline, setRecentTimeline] = useState<TimelineEvent[]>([]);

  // Load Data
  useEffect(() => {
    async function loadDashboard() {
      try {
        const [tasksRes, projRes, timeRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/projects"),
          fetch("/api/timeline"),
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
                type: e.type as TimelineEvent["type"],
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
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Current Focus Widget */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3"
      >
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          Current Focus
        </span>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">BrandsWay Landing Page</h2>
            <p className="text-sm text-muted-foreground">Office Work • Due at 5:00 PM</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
      </motion.div>

      {/* Today's Schedule & Progress Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4"
        >
          <SectionHeader
            title="Today's Schedule"
            action={<Clock className="w-4 h-4 text-muted-foreground" />}
          />
          <div className="flex flex-col gap-3">
            {[
              { time: "9:30 AM", label: "BrandsWay Development", type: "Work" },
              { time: "5:00 PM", label: "Chest & Triceps Workout", type: "Gym" },
              { time: "7:00 PM", label: "Mathematics Tuition", type: "Teaching" },
              { time: "9:00 PM", label: "Read AI Research Paper", type: "Learning" },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <span className="text-xs text-muted-foreground font-medium w-16 pt-0.5">
                  {item.time}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Today's Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4"
        >
          <SectionHeader
            title="Today's Progress"
            action={<CheckCircle className="w-4 h-4 text-muted-foreground" />}
          />
          {loading ? (
            <LoadingSkeleton variant="text" />
          ) : (
            <div className="flex flex-col gap-4">
              <ProgressCard
                label="Tasks Completed"
                completed={completedTasks}
                total={totalTasks}
                color="bg-primary"
              />
              <ProgressCard
                label="Projects Organized"
                completed={projectsCount > 0 ? 1 : 0}
                total={projectsCount || 1}
                color="bg-blue-500"
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex flex-col gap-3"
      >
        <SectionHeader title="Recent Activity" />
        {loading ? (
          <LoadingSkeleton variant="list" count={2} />
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentTimeline.map((item) => (
              <TimelineCard
                key={item.id}
                type={item.type}
                title={item.title}
                description={item.description}
                time={item.time}
              />
            ))}

            {recentTimeline.length === 0 && (
              <div className="text-center py-8 border border-border bg-card rounded-2xl text-xs text-muted-foreground p-4">
                No recent timeline logs recorded.
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
