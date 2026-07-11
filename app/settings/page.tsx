"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, LogOut, Bell, Palette, Globe, Shield } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import PageHeader from "@/components/common/PageHeader";

export default function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  // Settings states
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("#5E0ED7");
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch Settings
  useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      try {
        const res = await fetch("/api/settings", { headers: authHeaders });
        const data = await res.json();
        if (data) {
          setTheme(data.theme || "dark");
          setAccentColor(data.accentColor || "#5E0ED7");
          setLanguage(data.language || "en");
          setNotifications(data.notifications ?? true);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
    loadSettings();
  }, [user]);

  // Save Settings Changes
  const handleUpdateSetting = async (updates: {
    theme?: string;
    accentColor?: string;
    language?: string;
    notifications?: boolean;
  }) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data) {
        if (updates.theme !== undefined) setTheme(updates.theme);
        if (updates.accentColor !== undefined) setAccentColor(updates.accentColor);
        if (updates.language !== undefined) setLanguage(updates.language);
        if (updates.notifications !== undefined) setNotifications(updates.notifications);
      }
    } catch (err) {
      console.error("Failed to update settings", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 py-4">
      {/* Header */}
      <PageHeader
        title="Settings"
        description="Configure application preferences and manage profile."
        icon={Settings}
        iconColor="text-slate-400"
      />

      {/* User Profile Card */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-foreground">{user.name || "MyOS User"}</h3>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/15 border border-red-500/20 transition-all cursor-pointer font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </motion.div>
      )}

      {/* System Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">System Preferences</h3>
            <p className="text-[10px] text-muted-foreground">Adjust display & layout parameters</p>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex flex-col gap-4">
          {/* Theme */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Theme Mode</span>
            <select
              value={theme}
              onChange={(e) => handleUpdateSetting({ theme: e.target.value })}
              className="px-2.5 h-8 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none"
            >
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
            </select>
          </div>

          {/* Accent Color */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Accent Color</span>
            <select
              value={accentColor}
              onChange={(e) => handleUpdateSetting({ accentColor: e.target.value })}
              className="px-2.5 h-8 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none font-medium"
            >
              <option value="#5E0ED7">Royal Purple</option>
              <option value="#3B82F6">Deep Blue</option>
              <option value="#10B981">Emerald Green</option>
              <option value="#F97316">Sunset Orange</option>
            </select>
          </div>

          {/* Language */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">System Language</span>
            <select
              value={language}
              onChange={(e) => handleUpdateSetting({ language: e.target.value })}
              className="px-2.5 h-8 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none"
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="ur">اردو</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Notifications & Security */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Notifications</h3>
            <p className="text-[10px] text-muted-foreground">Manage pushes and updates alerts</p>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex flex-col gap-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Enable Push Notifications</span>
            <button
              onClick={() => handleUpdateSetting({ notifications: !notifications })}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                notifications ? "bg-primary" : "bg-secondary border border-border"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notifications ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
