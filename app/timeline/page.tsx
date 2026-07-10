"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Filter } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import TimelineCard from "@/components/cards/TimelineCard";
import EmptyState from "@/components/common/EmptyState";

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

  // Group events by date
  const filteredEvents = events.filter((e) => filterType === "All" || e.type === filterType);

  const dates = Array.from(new Set(filteredEvents.map((e) => e.date)));

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <PageHeader
        title="Timeline"
        description="Chronological log history of your daily activities."
        icon={Clock}
        iconColor="text-slate-400"
      />

      {/* Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        <Filter className="w-4 h-4 text-muted-foreground mr-1 shrink-0" />
        {(["All", "Work", "Teaching", "Learning", "Gym", "Mind"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
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
                .map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <TimelineCard
                      type={event.type}
                      title={event.title}
                      description={event.description}
                      time={event.time}
                    />
                  </motion.div>
                ))}
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <EmptyState
            icon={Clock}
            title="No Activity Found"
            description="No timeline events recorded for this category filter."
          />
        )}
      </div>
    </div>
  );
}
