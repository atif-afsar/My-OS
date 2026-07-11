"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Filter } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import TimelineCard from "@/components/cards/TimelineCard";
import EmptyState from "@/components/common/EmptyState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

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
  const [loading, setLoading] = useState(true);

  // States
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  // Load Data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/timeline");
        const data = await res.json();
        if (Array.isArray(data)) {
          setEvents(
            data.map((e: any) => {
              const dt = new Date(e.createdAt);
              const dateString = dt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const timeString = dt.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });
              
              // Map dynamic date labels
              const todayStr = new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yestStr = yesterday.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              let dateLabel = dateString;
              if (dateString === todayStr) dateLabel = "Today";
              else if (dateString === yestStr) dateLabel = "Yesterday";

              return {
                id: e.id,
                type: e.type as TimelineEvent["type"],
                title: e.title,
                description: e.description,
                time: timeString,
                date: dateLabel,
              };
            })
          );
        }
      } catch (err) {
        console.error("Failed to load timeline events", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
        {loading ? (
          <LoadingSkeleton variant="list" count={3} />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
