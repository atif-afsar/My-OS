"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Clock, Menu } from "lucide-react";
import { useNavigationStore } from "@/stores/navigation.store";

export default function BottomNavigation() {
  const pathname = usePathname();
  const { setMoreOpen } = useNavigationStore();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Learning", href: "/learning", icon: BookOpen },
    { label: "Spacer", href: "", icon: null }, // empty space for FAB
    { label: "Timeline", href: "/timeline", icon: Clock },
    { label: "More", href: "", icon: Menu, isActionButton: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[72px] bg-background/80 backdrop-blur-md border-t border-border z-30 w-full max-w-[768px] mx-auto flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,12px)]">
      {navItems.map((item, idx) => {
        if (!item.icon) {
          return <div key={idx} className="w-14 h-12" />; // Spacer for center FAB
        }

        const Icon = item.icon;
        const isActive = pathname === item.href && item.href !== "";

        if (item.isActionButton) {
          return (
            <button
              key={idx}
              onClick={() => setMoreOpen(true)}
              className="flex flex-col items-center justify-center gap-1 w-14 h-12 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Icon className="w-6 h-6 stroke-[2]" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={idx}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 w-14 h-12 transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-6 h-6 stroke-[2]" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
