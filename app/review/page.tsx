"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, ArrowLeft, ArrowRight, Check, Home, Sparkles } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { useAuthStore } from "@/stores/auth.store";

interface ReviewLog {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function DailyReviewPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  const [loading, setLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [existingReview, setExistingReview] = useState<ReviewLog | null>(null);

  // Questionnaire States
  const [step, setStep] = useState(1);
  const [q1, setQ1] = useState(""); // What did I complete?
  const [q2, setQ2] = useState(""); // What went well?
  const [q3, setQ3] = useState(""); // What should improve?
  const [q4, setQ4] = useState(""); // Tomorrow's priority?

  const [submitting, setSubmitting] = useState(false);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const expectedTitle = `Daily Review - ${todayLabel}`;

  // Check if review already exists today
  useEffect(() => {
    async function checkReview() {
      if (!user) return;
      try {
        const res = await fetch("/api/knowledge", { headers: authHeaders });
        const data = await res.json();
        if (Array.isArray(data)) {
          const match = data.find((item: any) => item.title === expectedTitle);
          if (match) {
            setAlreadyCompleted(true);
            setExistingReview(match);
          }
        }
      } catch (err) {
        console.error("Failed to check daily review status", err);
      } finally {
        setLoading(false);
      }
    }
    checkReview();
  }, [user, expectedTitle]);

  // Submit Review
  const handleSubmitReview = async () => {
    if (!q1.trim() || !q2.trim() || !q3.trim() || !q4.trim()) return;
    setSubmitting(true);

    const formattedContent = `### What did I complete?
${q1.trim()}

### What went well?
${q2.trim()}

### What should improve?
${q3.trim()}

### Tomorrow's priority?
${q4.trim()}`;

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
            title: `Completed Nightly Review`,
            description: `Reflections captured for ${todayLabel}`,
            referenceId: data.id,
            referenceType: "Knowledge",
          }),
        });

        router.push("/");
      }
    } catch (err) {
      console.error("Failed to submit nightly review", err);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, question: "What did you complete today?", value: q1, setter: setQ1, placeholder: "I completed the inbox module, did some tuition prep..." },
    { number: 2, question: "What went well today?", value: q2, setter: setQ2, placeholder: "The search bar works incredibly fast, felt focused during my gym session..." },
    { number: 3, question: "What should improve?", value: q3, setter: setQ3, placeholder: "I need to go to bed earlier, reduce screen time in the evening..." },
    { number: 4, question: "What is tomorrow's key priority?", value: q4, setter: setQ4, placeholder: "Implement swipe controls on mobile, test PWA offline caching..." },
  ];

  const currentStepInfo = steps[step - 1];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4">
        <PageHeader
          title="Nightly Review"
          description="Reflect on your day under 1 minute."
          icon={ClipboardList}
          iconColor="text-pink-500"
        />
        <LoadingSkeleton variant="card" count={1} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <PageHeader
        title="Nightly Review"
        description="Bring clarity to your progress and target tomorrow's priority."
        icon={ClipboardList}
        iconColor="text-pink-500"
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
            <h2 className="font-bold text-foreground text-lg">Reflection Complete</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              You have already logged your review for today, {todayLabel}.
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

          {/* Question Card */}
          <div className="p-6 border border-border bg-card rounded-2xl flex flex-col gap-4 shadow-sm min-h-[220px] justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-4 flex-1"
              >
                <div className="flex items-center gap-2 text-pink-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Reflection Prompt</span>
                </div>
                <h3 className="font-bold text-foreground text-base">
                  {currentStepInfo.question}
                </h3>
                <textarea
                  placeholder={currentStepInfo.placeholder}
                  value={currentStepInfo.value}
                  onChange={(e) => currentStepInfo.setter(e.target.value)}
                  className="w-full flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground min-h-[96px] resize-none"
                  autoFocus
                />
              </motion.div>
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
                  disabled={!currentStepInfo.value.trim()}
                  className="px-4 h-9 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/95 transition-all flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || !currentStepInfo.value.trim()}
                  className="px-4 h-9 bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
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
