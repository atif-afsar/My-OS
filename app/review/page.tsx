"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Star, ArrowLeft, ArrowRight, Check, Home, Sparkles, CheckSquare, Calendar, ClipboardList, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { useAuthStore } from "@/stores/auth.store";

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: string | null;
  category: string;
}

interface ReviewLog {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const EVENING_QUOTES = [
  { text: "When the light has been removed and my wife has fallen silent, I examine my entire day and go back over what I've done and said, hiding nothing from myself.", author: "Seneca" },
  { text: "Let not sleep descend upon your eyes before you have first examined each of your deeds of the day.", author: "Pythagoras" },
  { text: "At the end of each day, ask yourself: What bad habit did I conquer today? What virtue did I acquire?", author: "Seneca" },
  { text: "Well-spent hunger makes sleep sweet, and a well-spent life makes death peaceful.", author: "Leonardo da Vinci" },
];

export default function EveningShutdownPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  const [loading, setLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [existingReview, setExistingReview] = useState<ReviewLog | null>(null);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [tomorrowTasks, setTomorrowTasks] = useState<Task[]>([]);
  
  // Questionnaire States
  const [step, setStep] = useState(1);
  const [qWentWell, setQWentWell] = useState("");
  const [qImprove, setQImprove] = useState("");

  // New Task for Tomorrow
  const [newTomorrowTitle, setNewTomorrowTitle] = useState("");
  const [newTomorrowPriority, setNewTomorrowPriority] = useState("Medium");
  const [newTomorrowCategory, setNewTomorrowCategory] = useState("General");

  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState(EVENING_QUOTES[0]);

  const today = new Date();
  const todayLabel = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const expectedTitle = `Daily Review - ${todayLabel}`;

  const tomorrowDate = new Date();
  tomorrowDate.setDate(today.getDate() + 1);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        // 1. Check if review already exists today
        const knowRes = await fetch("/api/knowledge", { headers: authHeaders });
        const knowData = await knowRes.json();
        if (Array.isArray(knowData)) {
          const match = knowData.find((item: any) => item.title === expectedTitle);
          if (match) {
            setAlreadyCompleted(true);
            setExistingReview(match);
            setLoading(false);
            return;
          }
        }

        // 2. Fetch pending tasks
        const tasksRes = await fetch("/api/tasks", { headers: authHeaders });
        const tasksData = await tasksRes.json();
        if (Array.isArray(tasksData)) {
          const pending = tasksData.filter((t: Task) => t.status !== "Completed");
          setPendingTasks(pending);
        }
        
        // Select quote
        const randQ = EVENING_QUOTES[Math.floor(Math.random() * EVENING_QUOTES.length)];
        setQuote(randQ);
      } catch (err) {
        console.error("Failed to load shutdown data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, expectedTitle]);

  // Handle task complete quick action
  const handleQuickCompleteTask = async (id: string) => {
    try {
      setPendingTasks(pendingTasks.filter((t) => t.id !== id));
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ status: "Completed" }),
      });
      // Log timeline
      await fetch("/api/timeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          type: "Work",
          title: `Completed Task during Shutdown`,
          description: `Marked complete during day review`,
          referenceId: id,
          referenceType: "Task",
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle task reschedule quick action
  const handleRescheduleTask = async (id: string) => {
    try {
      setPendingTasks(pendingTasks.filter((t) => t.id !== id));
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ dueDate: tomorrowDate.toISOString() }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle adding new task for tomorrow
  const handleAddTomorrowTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTomorrowTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          title: newTomorrowTitle,
          status: "Todo",
          priority: newTomorrowPriority,
          dueDate: tomorrowDate.toISOString(),
          category: newTomorrowCategory,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setTomorrowTasks([...tomorrowTasks, data]);
        setNewTomorrowTitle("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Tomorrow task
  const handleDeleteTomorrowTask = async (id: string) => {
    try {
      setTomorrowTasks(tomorrowTasks.filter((t) => t.id !== id));
      await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Evening Shutdown
  const handleSubmitShutdown = async () => {
    if (!qWentWell.trim() || !qImprove.trim()) return;
    setSubmitting(true);

    const formattedContent = `### What went well today?
${qWentWell.trim()}

### What should improve?
${qImprove.trim()}

### Tomorrow's key targets planned
${tomorrowTasks.length > 0
  ? tomorrowTasks.map((t) => `- [${t.priority}] ${t.title}`).join("\n")
  : "No specific tomorrow tasks added."}`;

    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          title: expectedTitle,
          content: formattedContent,
          category: "Reflections",
          favorite: false,
        }),
      });
      const knowData = await res.json();

      if (knowData.id) {
        // Log timeline shutdown event
        await fetch("/api/timeline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            type: "Mind",
            title: "Completed Evening Shutdown",
            description: "Reflections logged, pending tasks cleared, tomorrow scheduled.",
            referenceId: knowData.id,
            referenceType: "Knowledge",
          }),
        });

        router.push("/");
      }
    } catch (err) {
      console.error("Failed to submit evening shutdown", err);
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4">
        <PageHeader
          title="Evening Shutdown"
          description="Clear your mind, log reflections, and plan tomorrow..."
          icon={Moon}
          iconColor="text-indigo-500"
        />
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <PageHeader
        title="Evening Shutdown"
        description="Reflect on your progress, organize pending items, and plan tomorrow."
        icon={Moon}
        iconColor="text-indigo-400"
      />

      {alreadyCompleted && existingReview ? (
        /* Completed State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl border border-border bg-card flex flex-col items-center text-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">OS Shutdown Complete</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Evening reflections and shutdown logged for today, {todayLabel}.
            </p>
          </div>

          <div className="w-full border-t border-border/60 pt-4 text-left">
            <h3 className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2.5">
              Logged Reflections
            </h3>
            <div className="p-4 bg-background/50 rounded-xl border border-border/50 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {existingReview.content}
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full h-11 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <Home className="w-4 h-4" /> Return to Dashboard
          </button>
        </motion.div>
      ) : (
        /* Form Questionnaire State */
        <div className="flex flex-col gap-4">
          {/* Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Complete</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step / 4) * 100}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>

          {/* Step Card */}
          <div className="p-6 border border-border bg-card rounded-2xl flex flex-col gap-4 shadow-sm min-h-[380px] justify-between">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-4 flex-1"
                >
                  <div className="flex items-center gap-2 text-indigo-400">
                    <ClipboardList className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Nightly Reflections</span>
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="font-bold text-foreground text-xs">
                      What went well today?
                    </h3>
                    <textarea
                      placeholder="Completed BrandsWay features, stayed completely focused, did standard gym workouts..."
                      value={qWentWell}
                      onChange={(e) => setQWentWell(e.target.value)}
                      className="w-full flex-1 min-h-[80px] max-h-[110px] px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1 flex-1 mt-1">
                    <h3 className="font-bold text-foreground text-xs">
                      What should improve?
                    </h3>
                    <textarea
                      placeholder="Spent too much time scrolling in afternoon, went to bed late yesterday..."
                      value={qImprove}
                      onChange={(e) => setQImprove(e.target.value)}
                      className="w-full flex-1 min-h-[80px] max-h-[110px] px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-4 flex-1"
                >
                  <div className="flex items-center gap-2 text-indigo-400">
                    <CheckSquare className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Clear Pending Tasks</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal mb-1">
                    Check off completed tasks or reschedule them to tomorrow. Keep the inbox clean.
                  </p>

                  {/* Tasks List */}
                  <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {pendingTasks.map((t) => (
                      <div key={t.id} className="p-3 bg-secondary/35 border border-border/50 rounded-xl flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] font-extrabold uppercase text-primary tracking-widest">{t.priority}</span>
                          <p className="text-xs font-bold text-foreground truncate mt-0.5">{t.title}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleRescheduleTask(t.id)}
                            className="text-[9px] font-bold px-2 py-1.5 rounded bg-violet-500/10 text-violet-400 hover:bg-violet-500 hover:text-white border border-violet-500/20 transition-all cursor-pointer"
                            title="Move to tomorrow"
                          >
                            Tomorrow
                          </button>
                          <button
                            onClick={() => handleQuickCompleteTask(t.id)}
                            className="text-[9px] font-bold px-2 py-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all cursor-pointer"
                            title="Complete Task"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ))}

                    {pendingTasks.length === 0 && (
                      <div className="text-center py-6 text-xs text-muted-foreground italic">
                        All tasks completed or cleared! Great job!
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-4 flex-1"
                >
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Plan Tomorrow</span>
                  </div>

                  {/* Add Task Form */}
                  <form onSubmit={handleAddTomorrowTask} className="flex gap-2 items-center bg-background/50 p-2 rounded-xl border border-border/60">
                    <input
                      type="text"
                      placeholder="Add target task for tomorrow..."
                      value={newTomorrowTitle}
                      onChange={(e) => setNewTomorrowTitle(e.target.value)}
                      className="flex-1 min-w-0 bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none px-2"
                      required
                    />
                    <select
                      value={newTomorrowPriority}
                      onChange={(e) => setNewTomorrowPriority(e.target.value)}
                      className="bg-secondary/60 text-[10px] font-bold text-foreground px-2 h-7 rounded border border-border focus:outline-none cursor-pointer shrink-0"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <button
                      type="submit"
                      className="w-7 h-7 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Tomorrow's Planned Tasks */}
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {tomorrowTasks.map((t) => (
                      <div key={t.id} className="p-2.5 bg-secondary/30 border border-border/40 rounded-xl flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] font-bold uppercase text-primary tracking-widest">{t.priority}</span>
                          <p className="text-xs font-semibold text-foreground truncate mt-0.5">{t.title}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteTomorrowTask(t.id)}
                          className="text-muted-foreground hover:text-destructive p-1 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {tomorrowTasks.length === 0 && (
                      <div className="text-center py-6 text-xs text-muted-foreground italic">
                        Add priorities above to plan tomorrow.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-4 flex-1 items-center justify-center text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 mb-1">
                    <Star className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">
                    Evening Reflection Ritual
                  </h3>
                  
                  <blockquote className="p-4 bg-secondary/20 border-l-2 border-violet-500 rounded-r-xl max-w-md text-left text-xs italic text-foreground/80 leading-relaxed my-2 relative">
                    <span className="absolute -top-3 left-2 text-violet-500/20 text-3xl font-serif">“</span>
                    "{quote.text}"
                    <cite className="block text-[10px] font-bold text-muted-foreground text-right mt-1.5 not-italic">— {quote.author}</cite>
                  </blockquote>

                  <p className="text-[10px] text-muted-foreground">
                    Your second brain is synced. Have a peaceful night's rest.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step Navigation Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-border/50">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>

              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 ? (!qWentWell.trim() || !qImprove.trim()) : false}
                  className="px-4 h-9 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/95 transition-all flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitShutdown}
                  disabled={submitting}
                  className="px-4 h-9 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {submitting ? "Closing OS..." : "Shutdown OS / Close Day"}{" "}
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
