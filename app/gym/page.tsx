"use client";

import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

export default function GymPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md p-6 rounded-2xl border border-border bg-card flex flex-col items-center gap-4 shadow-xl"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Dumbbell className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Gym Module</h2>
        <p className="text-sm text-muted-foreground">
          Track workout plans, sets, reps, logs, and personal best records.
        </p>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
          Coming in Phase 9
        </span>
      </motion.div>
    </div>
  );
}
