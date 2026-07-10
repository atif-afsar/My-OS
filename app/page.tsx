"use client";

import { motion } from "framer-motion";
import { Play, CheckCircle, Clock, BookOpen, Dumbbell, Briefcase } from "lucide-react";

export default function DashboardPage() {
  const progressItems = [
    { label: "Work", completed: 3, total: 5, color: "bg-blue-500" },
    { label: "Teaching", completed: 1, total: 2, color: "bg-emerald-500" },
    { label: "Learning", completed: 2, total: 4, color: "bg-purple-500" },
    { label: "Gym", completed: 0, total: 1, color: "bg-orange-500" },
  ];

  return (
    <div className="flex flex-col gap-6 py-4">
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
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">Today's Schedule</h3>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
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
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">Today's Progress</h3>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-4">
            {progressItems.map((item, idx) => {
              const pct = (item.completed / item.total) * 100;
              return (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">
                      {item.completed}/{item.total} tasks
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4"
      >
        <h3 className="font-bold text-foreground">Recent Activity</h3>
        <div className="flex flex-col gap-3">
          {[
            {
              icon: Briefcase,
              label: "Completed task 'Setup ESLint'",
              time: "10 mins ago",
              color: "text-blue-500 bg-blue-500/10",
            },
            {
              icon: BookOpen,
              label: "Added bookmark 'Tailwind CSS v4 Documentation'",
              time: "1 hour ago",
              color: "text-purple-500 bg-purple-500/10",
            },
            {
              icon: Dumbbell,
              label: "Logged workout 'Push Day Routine'",
              time: "Yesterday",
              color: "text-orange-500 bg-orange-500/10",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-foreground font-medium">{item.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
