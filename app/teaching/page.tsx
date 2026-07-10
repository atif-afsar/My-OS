"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export default function TeachingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md p-6 rounded-2xl border border-border bg-card flex flex-col items-center gap-4 shadow-xl"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Teaching Module</h2>
        <p className="text-sm text-muted-foreground">
          Manage lesson planning, homework assignments, student attendance, and tuition notes.
        </p>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
          Coming in Phase 7
        </span>
      </motion.div>
    </div>
  );
}
