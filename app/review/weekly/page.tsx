"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, ArrowLeft, ArrowRight, Check, Home, Sparkles, Award, AlertCircle, Dumbbell, BookOpen, Brain, CheckSquare } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { useAuthStore } from "@/stores/auth.store";

interface WeeklyReviewLog {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function WeeklyReviewPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  const [loading, setLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [existingReview, setExistingReview] = useState<WeeklyReviewLog | null>(null);

  // DB Stat Counts
  const [taskCount, setTaskCount] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);

  // Questionnaire States
  const [step, setStep] = useState(1);
  const [hoursWorked, setHoursWorked] = useState("40");
  const [hoursLearned, setHoursLearned] = useState("10");
  const [biggestWin, setBiggestWin] = useState("");
  const [areasMissed, setAreasMissed] = useState("");
  const [priorities, setPriorities] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Dates Setup
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const startStr = sevenDaysAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const dateRangeStr = `${startStr} - ${endStr}`;
  const expectedTitle = `Weekly Review - Week of ${dateRangeStr}`;

  useEffect(() => {
    async function loadWeeklyData() {
      if (!user) return;
      try {
        // 1. Check if weekly review already exists
        const knowledgeRes = await fetch("/api/knowledge", { headers: authHeaders });
        const knowledgeData = await knowledgeRes.json();

        if (Array.isArray(knowledgeData)) {
          const match = knowledgeData.find((item: any) => item.title === expectedTitle);
          if (match) {
            setAlreadyCompleted(true);
            setExistingReview(match);
            setLoading(false);
            return;
          }

          // Count notes added in last 7 days (excluding reviews)
          const weeklyNotes = knowledgeData.filter(
            (k: any) =>
              new Date(k.createdAt) >= sevenDaysAgo &&
              k.category !== "Reflections" &&
              k.category !== "Weekly Reviews"
          );
          setNotesCount(weeklyNotes.length);
        }

        // 2. Fetch completed tasks in last 7 days
        const tasksRes = await fetch("/api/tasks", { headers: authHeaders });
        const tasksData = await tasksRes.json();
        if (Array.isArray(tasksData)) {
          const completedTasks = tasksData.filter(
            (t: any) => t.status === "Completed" && new Date(t.updatedAt) >= sevenDaysAgo
          );
          setTaskCount(completedTasks.length);
        }

        // 3. Fetch gym workouts in last 7 days
        const workoutsRes = await fetch("/api/workouts", { headers: authHeaders });
        const workoutsData = await workoutsRes.json();
        if (Array.isArray(workoutsData)) {
          const weeklyWorkouts = workoutsData.filter(
            (w: any) => new Date(w.date) >= sevenDaysAgo
          );
          setWorkoutCount(weeklyWorkouts.length);
        }

        // 4. Fetch lessons in last 7 days
        const lessonsRes = await fetch("/api/lessons", { headers: authHeaders });
        const lessonsData = await lessonsRes.json();
        if (Array.isArray(lessonsData)) {
          const weeklyLessons = lessonsData.filter(
            (l: any) => new Date(l.date) >= sevenDaysAgo
          );
          setLessonCount(weeklyLessons.length);
        }

      } catch (err) {
        console.error("Failed to load weekly review statistics", err);
      } finally {
        setLoading(false);
      }
    }
    loadWeeklyData();
  }, [user, expectedTitle]);

  const handleSubmitWeeklyReview = async () => {
    if (!biggestWin.trim() || !areasMissed.trim() || !priorities.trim()) return;
    setSubmitting(true);

    const formattedContent = `## Weekly Metrics
- **Hours Worked**: ${hoursWorked.trim()} hours
- **Hours Learned**: ${hoursLearned.trim()} hours
- **Tasks Completed**: ${taskCount} tasks
- **Gym Workouts**: ${workoutCount} sessions
- **Lessons Taught**: ${lessonCount} sessions
- **Brain Notes Added**: ${notesCount} notes

## Weekly Reflections
### Biggest Win / Achievement
${biggestWin.trim()}

### Areas Missed / Improvements
${areasMissed.trim()}

### Next Week's Priorities
${priorities.trim()}`;

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
          category: "Weekly Reviews",
          favorite: false,
        }),
      });
      const data = await res.json();

      if (data.id) {
        // Log timeline event
        await fetch("/api/timeline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            type: "Mind",
            title: `Completed Weekly Review`,
            description: `Reflections captured for ${dateRangeStr}`,
            referenceId: data.id,
            referenceType: "Knowledge",
          }),
        });

        router.push("/");
      }
    } catch (err) {
      console.error("Failed to submit weekly review", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4">
        <PageHeader
          title="Weekly Review"
          description="Synthesize your weekly metrics and reflect on progress."
          icon={ClipboardList}
          iconColor="text-violet-500"
        />
        <LoadingSkeleton variant="card" count={1} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <PageHeader
        title="Weekly Review"
        description="Reflect on the past week, review key statistics, and set priority focus points for what's next."
        icon={ClipboardList}
        iconColor="text-violet-500"
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
            <h2 className="font-bold text-foreground text-lg">Weekly Review Complete</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reflections logged for the week of **{dateRangeStr}**.
            </p>
          </div>

          <div className="w-full border-t border-border/60 pt-4 text-left">
            <h3 className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2.5">
              Logged Reflections
            </h3>
            <div className="p-4 bg-background/50 rounded-xl border border-border/50 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed markdown-body">
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
              <span>Step {step} of 3</span>
              <span>{Math.round((step / 3) * 100)}% Complete</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(step / 3) * 100}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>

          {/* Steps Display */}
          <div className="p-6 border border-border bg-card rounded-2xl flex flex-col gap-4 shadow-sm min-h-[360px] justify-between">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-4 flex-1"
                >
                  <div className="flex items-center gap-2 text-violet-400">
                    <Award className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Weekly Metrics</span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm">
                    Verify metrics and log estimated work/learning hours:
                  </h3>

                  {/* Calculated Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <div className="p-3 bg-secondary/40 border border-border/50 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Tasks Completed</span>
                        <p className="text-sm font-extrabold text-foreground">{taskCount}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-secondary/40 border border-border/50 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Gym Workouts</span>
                        <p className="text-sm font-extrabold text-foreground">{workoutCount}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-secondary/40 border border-border/50 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Lessons Taught</span>
                        <p className="text-sm font-extrabold text-foreground">{lessonCount}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-secondary/40 border border-border/50 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Notes Captured</span>
                        <p className="text-sm font-extrabold text-foreground">{notesCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Hours Inputs */}
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] text-muted-foreground font-semibold uppercase">Hours Worked</label>
                      <input
                        type="number"
                        value={hoursWorked}
                        onChange={(e) => setHoursWorked(e.target.value)}
                        className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="40"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] text-muted-foreground font-semibold uppercase">Hours Learned</label>
                      <input
                        type="number"
                        value={hoursLearned}
                        onChange={(e) => setHoursLearned(e.target.value)}
                        className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="10"
                      />
                    </div>
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
                  <div className="flex items-center gap-2 text-violet-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Weekly Reflection</span>
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="font-bold text-foreground text-xs">
                      What was your biggest win/achievement this week?
                    </h3>
                    <textarea
                      placeholder="Successfully pushed the BrandsWay release, hit standard workout metrics..."
                      value={biggestWin}
                      onChange={(e) => setBiggestWin(e.target.value)}
                      className="w-full flex-1 min-h-[72px] max-h-[96px] px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1 flex-1 mt-1">
                    <h3 className="font-bold text-foreground text-xs">
                      Which areas were missed or could have gone better?
                    </h3>
                    <textarea
                      placeholder="Missed 1 lesson session, went to bed late on Wednesday..."
                      value={areasMissed}
                      onChange={(e) => setAreasMissed(e.target.value)}
                      className="w-full flex-1 min-h-[72px] max-h-[96px] px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
                    />
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
                  <div className="flex items-center gap-2 text-violet-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Next Week Planning</span>
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <h3 className="font-bold text-foreground text-sm">
                      What are your top priorities for next week?
                    </h3>
                    <p className="text-[10px] text-muted-foreground leading-normal mb-1.5">
                      Identify 3 clear, actionable objectives that will guide your schedule.
                    </p>
                    <textarea
                      placeholder="1. Implement the life heatmap widget&#10;2. Schedule tutor session prep&#10;3. Complete 4 gym workouts"
                      value={priorities}
                      onChange={(e) => setPriorities(e.target.value)}
                      className="w-full flex-1 min-h-[144px] px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
                    />
                  </div>
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

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 ? (!hoursWorked.trim() || !hoursLearned.trim()) : step === 2 ? (!biggestWin.trim() || !areasMissed.trim()) : false}
                  className="px-4 h-9 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/95 transition-all flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitWeeklyReview}
                  disabled={submitting || !priorities.trim()}
                  className="px-4 h-9 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Submit Review"}{" "}
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
