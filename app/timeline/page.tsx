"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function TimelinePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md p-6 rounded-2xl border border-border bg-card flex flex-col items-center gap-4 shadow-xl"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Timeline Module</h2>
        <p className="text-sm text-muted-foreground">
          Look back at your historic daily events, completed tasks, and workouts.
        </p>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
          Coming in Phase 11
        </span>
      </motion.div>
    </div>
  );
}
