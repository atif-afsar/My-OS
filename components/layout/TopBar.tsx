"use client";

import { useEffect, useState } from "react";
import { Search, User, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth.store";

interface SearchResults {
  tasks: any[];
  projects: any[];
  knowledge: any[];
  students: any[];
}

export default function TopBar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState("Hello");
  const [mounted, setMounted] = useState(false);

  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    tasks: [],
    projects: [],
    knowledge: [],
    students: [],
  });

  useEffect(() => {
    setMounted(true);
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good morning");
    else if (hours < 17) setGreeting("Good afternoon");
    else if (hours < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  // Debounced search trigger
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({ tasks: [], projects: [], knowledge: [], students: [] });
      return;
    }

    const delay = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data && !data.error) {
          setResults(data);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleResultClick = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  const hasResults =
    results.tasks.length > 0 ||
    results.projects.length > 0 ||
    results.knowledge.length > 0 ||
    results.students.length > 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-4 w-full max-w-[768px] mx-auto transition-all">
        <div className="flex flex-col">
          {mounted ? (
            <span className="text-xs text-muted-foreground font-medium">
              {greeting}, {user?.name || "Atif"} 👋
            </span>
          ) : (
            <span className="text-xs text-transparent font-medium">Placeholder</span>
          )}
          <h1 className="text-lg font-bold tracking-tight text-foreground">MyOS</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search everything"
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push("/settings")}
            aria-label="User Profile"
            className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-card text-muted-foreground hover:text-foreground transition-colors overflow-hidden cursor-pointer"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Spotlight Global Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="rounded-2xl border border-border bg-card p-0 sm:max-w-lg overflow-hidden shadow-2xl">
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search tasks, projects, notes, students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {searching && <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />}
          </div>

          {/* Results Area */}
          <div className="max-h-[360px] overflow-y-auto p-2 flex flex-col gap-3 scrollbar-thin">
            {!searchQuery.trim() ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                Type something to search globally across MyOS...
              </div>
            ) : !hasResults && !searching ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No matching results found.
              </div>
            ) : (
              <>
                {/* Tasks Category */}
                {results.tasks.length > 0 && (
                  <div>
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider px-3 block mb-1">
                      Tasks
                    </span>
                    <div className="flex flex-col">
                      {results.tasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => handleResultClick("/work")}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/60 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                        >
                          <span className="text-foreground/90 font-medium group-hover:text-primary transition-colors">
                            {task.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {task.status} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Category */}
                {results.projects.length > 0 && (
                  <div>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider px-3 block mb-1">
                      Projects
                    </span>
                    <div className="flex flex-col">
                      {results.projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleResultClick("/work")}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/60 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                        >
                          <span className="text-foreground/90 font-medium group-hover:text-primary transition-colors">
                            {project.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {project.status} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Knowledge Base */}
                {results.knowledge.length > 0 && (
                  <div>
                    <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider px-3 block mb-1">
                      Second Brain / Notes
                    </span>
                    <div className="flex flex-col">
                      {results.knowledge.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleResultClick("/mind")}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/60 flex flex-col gap-0.5 transition-colors cursor-pointer group"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-foreground/90 font-medium group-hover:text-primary transition-colors">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              {item.category} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate w-full pr-4">
                            {item.content}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Students Registry */}
                {results.students.length > 0 && (
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-3 block mb-1">
                      Tuition Students
                    </span>
                    <div className="flex flex-col">
                      {results.students.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleResultClick("/teaching")}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/60 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                        >
                          <span className="text-foreground/90 font-medium group-hover:text-primary transition-colors">
                            {student.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {student.className} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
