"use client";

import { motion } from "framer-motion";
import { Play, Clock, CheckCircle } from "lucide-react";
import ProgressCard from "@/components/cards/ProgressCard";
import TimelineCard from "@/components/cards/TimelineCard";
import SectionHeader from "@/components/common/SectionHeader";

export default function DashboardPage() {
  const progressItems = [
    { label: "Work", completed: 3, total: 5, color: "bg-blue-500" },
    { label: "Teaching", completed: 1, total: 2, color: "bg-emerald-500" },
    { label: "Learning", completed: 2, total: 4, color: "bg-purple-500" },
    { label: "Gym", completed: 0, total: 1, color: "bg-orange-500" },
  ];

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
          <div className="flex flex-col gap-4">
            {progressItems.map((item, idx) => (
              <ProgressCard
                key={idx}
                label={item.label}
                completed={item.completed}
                total={item.total}
                color={item.color}
              />
            ))}
          </div>
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
        <div className="flex flex-col gap-2.5">
          <TimelineCard
            type="Work"
            title="Completed task 'Setup ESLint'"
            description="Office Work • Verified linting compilation scripts"
            time="10 mins ago"
          />
          <TimelineCard
            type="Learning"
            title="Added bookmark 'Tailwind CSS v4 Documentation'"
            description="Learning Resource • Saved documentation links"
            time="1 hour ago"
          />
          <TimelineCard
            type="Gym"
            title="Logged workout 'Push Day Routine'"
            description="Logged workout sets: chest, shoulder, triceps lifts"
            time="Yesterday"
          />
        </div>
      </motion.div>
    </div>
  );
}
