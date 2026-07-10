"use client";

import { useNavigationStore } from "@/stores/navigation.store";
import TopBar from "./TopBar";
import BottomNavigation from "./BottomNavigation";
import FloatingActionButton from "./FloatingActionButton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Briefcase,
  GraduationCap,
  Dumbbell,
  Brain,
  Settings,
  CheckSquare,
  FileText,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isQuickAddOpen, setQuickAddOpen, isMoreOpen, setMoreOpen } =
    useNavigationStore();

  const handleMoreClick = () => {
    setMoreOpen(false);
  };

  const moreItems = [
    { label: "Work", href: "/work", icon: Briefcase, color: "text-blue-500" },
    { label: "Teaching", href: "/teaching", icon: GraduationCap, color: "text-emerald-500" },
    { label: "Gym", href: "/gym", icon: Dumbbell, color: "text-orange-500" },
    { label: "Mind", href: "/mind", icon: Brain, color: "text-purple-500" },
    { label: "Settings", href: "/settings", icon: Settings, color: "text-slate-400" },
  ];

  const quickAddItems = [
    { label: "Task", icon: CheckSquare, desc: "Add something to do" },
    { label: "Idea", icon: Lightbulb, desc: "Capture a sudden thought" },
    { label: "Quick Note", icon: FileText, desc: "Write a general note" },
    { label: "Learning Resource", icon: BookOpen, desc: "Save a study link/note" },
    { label: "Gym Workout", icon: Dumbbell, desc: "Log a workout session" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none">
      <TopBar />
      <main className="flex-1 pt-20 pb-[88px] px-4 w-full max-w-[768px] mx-auto flex flex-col">
        {children}
      </main>
      <FloatingActionButton />
      <BottomNavigation />

      {/* More Navigation Drawer */}
      <Sheet open={isMoreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-t border-border bg-card p-6 pb-[calc(20px+env(safe-area-inset-bottom,12px))]"
        >
          <SheetHeader className="p-0 mb-4">
            <SheetTitle className="text-lg font-bold text-foreground">
              Explore MyOS
            </SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3">
            {moreItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={handleMoreClick}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background/50 hover:bg-secondary transition-colors"
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium text-foreground">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Quick Add Dialog */}
      <Dialog open={isQuickAddOpen} onOpenChange={setQuickAddOpen}>
        <DialogContent className="rounded-xl border border-border bg-card p-6 sm:max-w-md">
          <DialogHeader className="p-0 mb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Quick Capture
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {quickAddItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setQuickAddOpen(false);
                    console.log(`Quick capture for ${item.label} clicked`);
                  }}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border bg-background/50 hover:bg-secondary transition-colors text-left w-full cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
