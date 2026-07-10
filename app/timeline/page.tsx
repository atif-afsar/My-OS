"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Briefcase,
  GraduationCap,
  BookOpen,
  Dumbbell,
  Brain,
  CheckCircle,
  Tag,
  Filter,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "Work" | "Teaching" | "Learning" | "Gym" | "Mind" | "General";
  title: string;
  description: string;
  time: string;
  date: string;
}

export default function TimelinePage() {
  const [filterType, setFilterType] = useState<TimelineEvent["type"] | "All">("All");

  // Local state for Timeline events
  const [events] = useState<TimelineEvent[]>([
    // Today
    {
      id: "1",
      type: "Work",
      title: "Completed Task",
      description: "Build AppShell and Navigation",
      time: "10:15 AM",
      date: "Today",
    },
    {
      id: "2",
      type: "Learning",
      title: "Saved Bookmark",
      description: "Added Next.js Turbopack Config Docs",
      time: "9:30 AM",
      date: "Today",
    },
    // Yesterday
    {
      id: "3",
      type: "Gym",
      title: "Logged Workout",
      description: "Push Day Routine (4 exercises, 13 sets logged)",
      time: "6:15 PM",
      date: "Yesterday",
    },
    {
      id: "4",
      type: "Work",
      title: "Logged Daily summary",
      description: "Completed the Phase 1 Foundation layout structures.",
      time: "5:30 PM",
      date: "Yesterday",
    },
    {
      id: "5",
      type: "Teaching",
      title: "Logged Lesson",
      description: "Zayan Khan (Maths) - Introduction to Quadratic Equations",
      time: "4:00 PM",
      date: "Yesterday",
    },
    // July 09, 2026
    {
      id: "6",
      type: "Mind",
      title: "Saved Philosophy Note",
      description: "Amor Fati — Loving One's Fate",
      time: "9:00 PM",
      date: "July 09, 2026",
    },
    {
      id: "7",
      type: "Learning",
      title: "Created Study Note",
      description: "React Server Components vs Client Components in Next.js 15",
      time: "11:30 AM",
      date: "July 09, 2026",
    },
  ]);

  const getEventIcon = (type: TimelineEvent["type"]) => {
    const icons = {
      Work: Briefcase,
      Teaching: GraduationCap,
      Learning: BookOpen,
      Gym: Dumbbell,
      Mind: Brain,
      General: Clock,
    };
    return icons[type] || Clock;
  };

  const getEventBadgeStyles = (type: TimelineEvent["type"]) => {
    const styles = {
      Work: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Teaching: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Learning: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Gym: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      Mind: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      General: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return styles[type] || styles.General;
  };

  // Group events by date
  const filteredEvents = events.filter((e) => filterType === "All" || e.type === filterType);

  const dates = Array.from(new Set(filteredEvents.map((e) => e.date)));

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Timeline</h2>
          <p className="text-sm text-muted-foreground">Chronological log history of your daily activities.</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        <Filter className="w-4 h-4 text-muted-foreground mr-1 shrink-0" />
        {(["All", "Work", "Teaching", "Learning", "Gym", "Mind"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              filterType === type
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Timeline Tree */}
      <div className="flex flex-col gap-6">
        {dates.map((date) => (
          <div key={date} className="flex flex-col gap-3">
            {/* Date Header */}
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-2 border-l-2 border-primary/50">
              {date}
            </h3>

            {/* Event list for this date */}
            <div className="flex flex-col gap-2.5 pl-2 relative before:absolute before:left-6.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
              {filteredEvents
                .filter((e) => e.date === date)
                .map((event) => {
                  const Icon = getEventIcon(event.type);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4 items-center bg-card p-3.5 rounded-xl border border-border/80 hover:bg-secondary/40 transition-colors shadow-sm"
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getEventBadgeStyles(event.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="font-bold text-sm text-foreground truncate">{event.title}</h4>
                          <span className="text-[10px] text-muted-foreground shrink-0">{event.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">
                          {event.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="text-center py-16 border border-border bg-card rounded-2xl p-6 flex flex-col items-center gap-3">
            <Clock className="w-10 h-10 text-muted-foreground animate-pulse" />
            <h4 className="font-bold text-foreground text-sm">No Activity Found</h4>
            <p className="text-xs text-muted-foreground max-w-xs">
              No timeline events recorded for this category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
