"use client";

import { useEffect, useState } from "react";
import { Search, User } from "lucide-react";

export default function TopBar() {
  const [greeting, setGreeting] = useState("Hello");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good morning");
    else if (hours < 17) setGreeting("Good afternoon");
    else if (hours < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-4 w-full max-w-[768px] mx-auto transition-all">
      <div className="flex flex-col">
        {mounted ? (
          <span className="text-xs text-muted-foreground font-medium">
            {greeting}, Atif 👋
          </span>
        ) : (
          <span className="text-xs text-transparent font-medium">Placeholder</span>
        )}
        <h1 className="text-lg font-bold tracking-tight text-foreground">MyOS</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Search everything"
          className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          aria-label="User Profile"
          className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-card text-muted-foreground hover:text-foreground transition-colors overflow-hidden"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
