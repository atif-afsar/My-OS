"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col gap-6 py-4">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Configure application settings and user profile.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">System Preferences</h3>
            <p className="text-xs text-muted-foreground">V1.0.0 Foundation Stable</p>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Theme Mode</span>
            <span className="font-medium text-foreground">Dark (Standard)</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Accent Color</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="font-medium text-foreground">Royal Purple (#5E0ED7)</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">PWA Installation</span>
            <span className="font-medium text-emerald-500">Standalone Supported</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
