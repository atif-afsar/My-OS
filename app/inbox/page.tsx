"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  Plus,
  Trash2,
  Star,
  CheckCircle,
  FolderOpen,
  ArrowRight,
  ClipboardList,
  Edit2,
  Check,
  ChevronDown,
  Mic,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import SwipeableItem from "@/components/common/SwipeableItem";
import VoiceCaptureModal from "@/components/common/VoiceCaptureModal";
import { useAuthStore } from "@/stores/auth.store";

interface InboxItem {
  id: string;
  title: string;
  content: string;
  category: string;
  favorite: boolean;
  createdAt: string;
}

export default function InboxPage() {
  const { user } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [newCapture, setNewCapture] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Dropdown menus tracking by ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Load Inbox Items
  useEffect(() => {
    async function loadInbox() {
      if (!user) return;
      try {
        const res = await fetch("/api/knowledge", { headers: authHeaders });
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter only items with category === "Inbox" or "Ideas" (if they are uncategorized)
          const inboxItems = data.filter(
            (item: any) => item.category === "Inbox" || item.category === "Ideas" || !item.category
          );
          setItems(inboxItems);
        }
      } catch (err) {
        console.error("Failed to load inbox items", err);
      } finally {
        setLoading(false);
      }
    }
    loadInbox();
  }, [user]);

  // Handle redirect autofocus from FAB Capture
  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("add") === "true") {
        const inputEl = document.querySelector("input[placeholder*='Capture']");
        if (inputEl) {
          (inputEl as HTMLInputElement).focus();
        }
      }
    }
  }, [loading]);

  // Handlers
  const handleQuickCapture = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCapture.trim()) return;

    // Use first 30 characters as title, remaining as content
    const title = newCapture.trim().substring(0, 35);
    const content = newCapture.trim();

    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          title,
          content,
          category: "Inbox",
          favorite: false,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setItems([data, ...items]);
        setNewCapture("");

        // Log timeline event
        await fetch("/api/timeline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            type: "Mind",
            title: `Captured to Inbox: ${data.title}`,
            description: "Awaiting organization",
            referenceId: data.id,
            referenceType: "Inbox",
          }),
        });
      }
    } catch (err) {
      console.error("Failed to capture item", err);
    }
  };

  const handleToggleFavorite = async (id: string, currentFav: boolean) => {
    try {
      setItems(items.map((i) => (i.id === id ? { ...i, favorite: !currentFav } : i)));

      await fetch("/api/knowledge", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          id,
          favorite: !currentFav,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setItems(items.filter((i) => i.id !== id));
      await fetch(`/api/knowledge?id=${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (item: InboxItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditContent(item.content);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      setItems(
        items.map((i) => (i.id === id ? { ...i, title: editTitle, content: editContent } : i))
      );
      setEditingId(null);

      await fetch("/api/knowledge", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          id,
          title: editTitle,
          content: editContent,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveCategory = async (id: string, newCategory: string) => {
    try {
      setItems(items.filter((i) => i.id !== id));
      setActiveMenuId(null);

      const res = await fetch("/api/knowledge", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          id,
          category: newCategory,
        }),
      });
      const data = await res.json();

      // Log timeline
      if (data.id) {
        await fetch("/api/timeline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            type: "Mind",
            title: `Organized Inbox item`,
            description: `Moved "${data.title}" to ${newCategory}`,
            referenceId: data.id,
            referenceType: "Knowledge",
          }),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToTask = async (item: InboxItem) => {
    try {
      // 1. Remove from local list & delete inbox knowledge record
      setItems(items.filter((i) => i.id !== item.id));
      setActiveMenuId(null);

      // Delete knowledge item
      await fetch(`/api/knowledge?id=${item.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      // 2. Create Task item in Database
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          title: item.title,
          description: item.content,
          priority: "Medium",
          status: "Todo",
        }),
      });
      const data = await res.json();

      // Log timeline
      if (data.id) {
        await fetch("/api/timeline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            type: "Work",
            title: `Converted Inbox to Task: ${data.title}`,
            description: "Moved to Work Dashboard",
            referenceId: data.id,
            referenceType: "Task",
          }),
        });
      }
    } catch (err) {
      console.error("Failed to convert item to task", err);
    }
  };

  const handleVoiceSave = async (text: string) => {
    try {
      const res = await fetch("/api/knowledge", { headers: authHeaders });
      const data = await res.json();
      if (Array.isArray(data)) {
        const inboxItems = data.filter(
          (item: any) => item.category === "Inbox" || item.category === "Ideas" || !item.category
        );
        setItems(inboxItems);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <PageHeader
        title="Universal Inbox"
        description="Frictionless capture. Log thoughts now, organize them later."
        icon={Inbox}
        iconColor="text-purple-500"
      />

      {/* Capture Area */}
      <form onSubmit={handleQuickCapture} className="flex gap-2">
        <div className="flex-1 bg-card border border-border rounded-xl flex items-center px-3 gap-2 focus-within:ring-1 focus-within:ring-primary">
          <input
            type="text"
            placeholder="Capture an idea, quote, note, or quick task..."
            value={newCapture}
            onChange={(e) => setNewCapture(e.target.value)}
            className="flex-1 h-11 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setIsVoiceOpen(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer"
            title="Speech Dictation"
          >
            <Mic className="w-4 h-4 text-purple-400" />
          </button>
        </div>
        <button
          type="submit"
          className="px-4 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Capture
        </button>
      </form>

      {/* Inbox Items Grid */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <LoadingSkeleton variant="card" count={3} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Your Inbox is Empty"
            description="Use the capture bar above or the bottom FAB button to log tasks, reflections, or notes instantly."
          />
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {items.map((item) => (
                <SwipeableItem
                  key={item.id}
                  onSwipeLeft={() => handleDeleteItem(item.id)}
                  onSwipeRight={() => handleToggleFavorite(item.id, item.favorite)}
                  onLongPress={() => handleStartEdit(item)}
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-2xl border border-border bg-card flex flex-col gap-3 shadow-xs relative"
                  >
                    {editingId === item.id ? (
                      /* Inline Editing Mode */
                      <div className="flex flex-col gap-2.5">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="px-3 h-9 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none min-h-[72px]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <>
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-foreground text-sm tracking-tight">
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-wrap">
                              {item.content}
                            </p>
                            <span className="inline-block text-[9px] text-muted-foreground/80 mt-2 font-medium">
                              Captured on {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Top-Right Item Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleToggleFavorite(item.id, item.favorite)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                item.favorite
                                  ? "text-amber-400 bg-amber-500/5 border border-amber-500/10"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                              aria-label="Toggle favorite"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              aria-label="Edit item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                              aria-label="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Organize Footer Dropdown menu */}
                        <div className="border-t border-border/50 pt-2.5 flex justify-between items-center relative">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                            Move & Organize
                          </span>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenuId(activeMenuId === item.id ? null : item.id)
                              }
                              className="text-xs px-2.5 py-1 rounded-lg bg-secondary/80 text-foreground border border-border hover:bg-secondary transition-all flex items-center gap-1 cursor-pointer font-medium"
                            >
                              Organize <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            </button>

                            {activeMenuId === item.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setActiveMenuId(null)}
                                />
                                <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-card border border-border rounded-xl shadow-xl z-50 p-1 flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                                  <span className="text-[9px] font-bold text-muted-foreground/80 px-2 py-1 uppercase tracking-wider block">
                                    Convert to:
                                  </span>
                                  <button
                                    onClick={() => handleConvertToTask(item)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-secondary flex items-center gap-1.5 cursor-pointer font-semibold"
                                  >
                                    <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
                                    Task Dashboard
                                  </button>
                                  <div className="border-t border-border/50 my-1" />
                                  <span className="text-[9px] font-bold text-muted-foreground/80 px-2 py-1 uppercase tracking-wider block">
                                    Second Brain Category:
                                  </span>
                                  {[
                                    { label: "Philosophy", cat: "Philosophy", color: "text-purple-400" },
                                    { label: "Ideas", cat: "Ideas", color: "text-amber-400" },
                                    { label: "Quotes", cat: "Quotes", color: "text-blue-400" },
                                    { label: "Islamic Notes", cat: "Islamic Notes", color: "text-emerald-400" },
                                    { label: "Reflections", cat: "Reflections", color: "text-pink-400" },
                                  ].map((folder) => (
                                    <button
                                      key={folder.cat}
                                      onClick={() => handleMoveCategory(item.id, folder.cat)}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-secondary flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <FolderOpen className={`w-3.5 h-3.5 ${folder.color}`} />
                                      {folder.label}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </SwipeableItem>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <VoiceCaptureModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSave={handleVoiceSave}
        shouldSaveToDb={true}
      />
    </div>
  );
}
