"use client";

import { Plus } from "lucide-react";
import { useNavigationStore } from "@/stores/navigation.store";

export default function FloatingActionButton() {
  const { setQuickAddOpen } = useNavigationStore();

  return (
    <button
      onClick={() => setQuickAddOpen(true)}
      className="fixed bottom-[calc(20px+env(safe-area-inset-bottom,12px))] left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 flex items-center justify-center z-40 transition-all cursor-pointer border border-primary/20"
      aria-label="Quick Add"
    >
      <Plus className="w-7 h-7 stroke-[2.5]" />
    </button>
  );
}
