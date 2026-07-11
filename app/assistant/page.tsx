"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Mic,
  Loader2,
  CheckCircle,
  HelpCircle,
  Brain,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import VoiceCaptureModal from "@/components/common/VoiceCaptureModal";
import { useAuthStore } from "@/stores/auth.store";

interface Message {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  commandExecuted?: string; // Shows if a command was run
}

export default function AssistantPage() {
  const { user } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello Atif. I am your MyOS Assistant. I have synchronized with your tasks, active projects, second brain notes, and recent gym workouts. Ask me for a summary, focus suggestions, or ask me to schedule tasks and reflections!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Execute commands extracted by AI
  const executeCommand = async (command: { action: string; data: any }) => {
    const { action, data } = command;
    try {
      if (action === "CREATE_TASK") {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            title: data.title,
            priority: data.priority || "Medium",
            status: "Todo",
          }),
        });
        const task = await res.json();
        if (task.id) {
          // Log timeline
          await fetch("/api/timeline", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify({
              type: "Work",
              title: `AI created task: ${task.title}`,
              description: `Automated by MyOS AI`,
              referenceId: task.id,
              referenceType: "Task",
            }),
          });
          return `Successfully created Task: "${task.title}" (Priority: ${task.priority})`;
        }
      } else if (action === "CREATE_NOTE") {
        const res = await fetch("/api/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            title: data.title,
            content: data.content,
            category: data.category || "Inbox",
            favorite: false,
          }),
        });
        const note = await res.json();
        if (note.id) {
          // Log timeline
          await fetch("/api/timeline", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify({
              type: "Mind",
              title: `AI saved note: ${note.title}`,
              description: `Automated by MyOS AI`,
              referenceId: note.id,
              referenceType: "Knowledge",
            }),
          });
          return `Successfully saved note to Second Brain: "${note.title}" under ${note.category}`;
        }
      } else if (action === "LOG_WORKOUT") {
        const res = await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({
            exercise: data.exercise,
            sets: data.sets,
            reps: data.reps,
            weight: data.weight,
          }),
        });
        const workout = await res.json();
        if (workout.id) {
          // Log timeline
          await fetch("/api/timeline", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify({
              type: "Gym",
              title: `AI logged workout: ${workout.exercise}`,
              description: `Automated by MyOS AI`,
              referenceId: workout.id,
              referenceType: "Workout",
            }),
          });
          return `Successfully logged workout: ${workout.exercise} (${workout.sets}x${workout.reps} @ ${workout.weight}kg)`;
        }
      }
    } catch (e) {
      console.error("Failed to run command", e);
      return `Failed to execute command: ${action}`;
    }
    return null;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setErrorMessage("");
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          message: textToSend,
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setErrorMessage(data.error);
        return;
      }

      // Add assistant response bubble
      const assistantMsg: Message = {
        id: Math.random().toString(),
        sender: "assistant",
        text: data.message || "I've processed your query.",
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If there is an action command, execute it!
      if (data.command) {
        const sysResponse = await executeCommand(data.command);
        if (sysResponse) {
          const sysMsg: Message = {
            id: Math.random().toString(),
            sender: "system",
            text: sysResponse,
          };
          setMessages((prev) => [...prev, sysMsg]);
        }
      }
    } catch (err: any) {
      setErrorMessage("Could not connect to MyOS AI core. Verify API configuration.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSave = (text: string) => {
    handleSendMessage(text);
  };

  const quickPrompts = [
    "Summarize my day",
    "List my high priority tasks",
    "Find gym workouts this week",
    "Add task Schedule Brandsway prep",
  ];

  return (
    <div className="flex-1 flex flex-col gap-3 py-2 h-[calc(100vh-185px)] min-h-0">
      {/* Header */}
      <PageHeader
        title="MyOS Copilot"
        description="Your dashboard intelligence core powered by Gemini."
        icon={Brain}
        iconColor="text-violet-500"
      />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto border border-border bg-card/45 rounded-2xl p-4 flex flex-col gap-4 min-h-0 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            if (msg.sender === "system") {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold self-center max-w-[90%]"
                >
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{msg.text}</span>
                </motion.div>
              );
            }

            const isUser = msg.sender === "user";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}
              >
                {/* Avatar dot */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-bold ${
                    isUser
                      ? "bg-primary border-primary/25 text-primary-foreground"
                      : "bg-violet-500/10 border-violet-500/20 text-violet-400"
                  }`}
                >
                  {isUser ? "AA" : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble content */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                      : "bg-secondary text-foreground rounded-tl-none border border-border/80 whitespace-pre-wrap"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[85%] self-start"
            >
              <div className="w-7 h-7 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="p-3.5 bg-secondary text-muted-foreground rounded-2xl rounded-tl-none border border-border/85 flex items-center gap-1.5 text-xs font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Thinking...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Error Output */}
      {errorMessage && (
        <div className="px-4 py-2.5 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Prompts Pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 shrink-0">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-full border border-border bg-card hover:bg-secondary text-foreground/80 hover:text-foreground text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer shadow-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="flex gap-2 shrink-0">
        <div className="flex-1 bg-card border border-border rounded-xl flex items-center px-3 gap-2 focus-within:ring-1 focus-within:ring-primary">
          <input
            type="text"
            placeholder="Ask AI anything, or say 'add task...'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage(input);
            }}
            disabled={loading}
            className="flex-1 h-11 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => setIsVoiceOpen(true)}
            disabled={loading}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer disabled:opacity-30"
            title="Speech Dictation"
          >
            <Mic className="w-4 h-4 text-violet-400" />
          </button>
        </div>
        <button
          onClick={() => handleSendMessage(input)}
          disabled={loading || !input.trim()}
          className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Dictation Overlay */}
      <VoiceCaptureModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSave={handleVoiceSave}
        shouldSaveToDb={false}
      />
    </div>
  );
}
