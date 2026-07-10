"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  FolderOpen,
  FileText,
  Link as LinkIcon,
  Plus,
  Trash2,
  ExternalLink,
  Tag,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import LearningCard from "@/components/cards/LearningCard";
import EmptyState from "@/components/common/EmptyState";
import SectionHeader from "@/components/common/SectionHeader";

interface LearningTopic {
  id: string;
  title: string;
  category: "AI" | "Programming" | "Business" | "Marketing" | "Design" | "Books";
  progress: number;
  status: "Not Started" | "Learning" | "Mastered";
}

interface LearningNote {
  id: string;
  topicTitle: string;
  title: string;
  content: string;
  tags: string[];
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string;
}

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState<"topics" | "notes" | "bookmarks">("topics");

  // Local state for Topics
  const [topics, setTopics] = useState<LearningTopic[]>([
    { id: "1", title: "Next.js 15 App Router & Server Components", category: "Programming", progress: 80, status: "Learning" },
    { id: "2", title: "Deep Learning Foundations (Transformers)", category: "AI", progress: 45, status: "Learning" },
    { id: "3", title: "Product Positioning and Value Matrix", category: "Marketing", progress: 10, status: "Not Started" },
    { id: "4", title: "Clean Code & Refactoring Patterns", category: "Programming", progress: 95, status: "Mastered" },
    { id: "5", title: "Marcus Aurelius Meditations Book Notes", category: "Books", progress: 60, status: "Learning" },
  ]);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState<LearningTopic["category"]>("AI");

  // Local state for Notes
  const [notes, setNotes] = useState<LearningNote[]>([
    {
      id: "1",
      topicTitle: "Next.js 15 App Router",
      title: "React Server Components vs Client Components",
      content: "RSCs execute only on the server, which means zero bundle size impact. Use client components only when interactivity (useState, useEffect) is strictly required.",
      tags: ["RSC", "NextJS", "Optimization"],
    },
    {
      id: "2",
      topicTitle: "Deep Learning Foundations",
      title: "Self-Attention Mechanism Formulas",
      content: "Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V. This allows the transformer to weight token relationships dynamically regardless of sequence length.",
      tags: ["Transformers", "AI", "Math"],
    },
  ]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // Local state for Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    {
      id: "1",
      title: "Next.js Turbopack Configuration Documentation",
      url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack",
      category: "Documentation",
      description: "How to resolve root folders and configure compile options for Turbopack.",
    },
    {
      id: "2",
      title: "Zustand State Caching Best Practices",
      url: "https://github.com/pmndrs/zustand",
      category: "GitHub",
      description: "Offline persistence middleware guidelines for Zustand stores.",
    },
  ]);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState("");
  const [newBookmarkUrl, setNewBookmarkUrl] = useState("");
  const [newBookmarkDesc, setNewBookmarkDesc] = useState("");

  // Handlers
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const newTopic: LearningTopic = {
      id: Date.now().toString(),
      title: newTopicTitle,
      category: newTopicCategory,
      progress: 0,
      status: "Not Started",
    };

    setTopics([...topics, newTopic]);
    setNewTopicTitle("");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote: LearningNote = {
      id: Date.now().toString(),
      topicTitle: selectedTopic || "General",
      title: newNoteTitle,
      content: newNoteContent,
      tags: ["MyOS"],
    };

    setNotes([newNote, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
  };

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmarkTitle.trim() || !newBookmarkUrl.trim()) return;

    const newBmk: Bookmark = {
      id: Date.now().toString(),
      title: newBookmarkTitle,
      url: newBookmarkUrl,
      category: "Resource",
      description: newBookmarkDesc,
    };

    setBookmarks([newBmk, ...bookmarks]);
    setNewBookmarkTitle("");
    setNewBookmarkUrl("");
    setNewBookmarkDesc("");
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <PageHeader
        title="Learning Module"
        description="Store everything you learn and track study progress."
        icon={BookOpen}
        iconColor="text-purple-500"
      />

      {/* Tabs */}
      <div className="flex border-b border-border text-sm overflow-x-auto scrollbar-none gap-2">
        {(
          [
            { id: "topics", label: "Subjects", icon: FolderOpen },
            { id: "notes", label: "Study Notes", icon: FileText },
            { id: "bookmarks", label: "Bookmarks", icon: LinkIcon },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex flex-col gap-4">
        {/* SUBJECTS TAB */}
        {activeTab === "topics" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Quick Add Subject */}
            <form onSubmit={handleAddTopic} className="flex gap-2">
              <input
                type="text"
                placeholder="New study subject / course title..."
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                className="flex-1 px-4 h-11 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
              <select
                value={newTopicCategory}
                onChange={(e) => setNewTopicCategory(e.target.value as LearningTopic["category"])}
                className="px-3 h-11 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                <option value="AI">AI</option>
                <option value="Programming">Programming</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="Design">Design</option>
                <option value="Books">Books</option>
              </select>
              <button type="submit" className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            {/* Topic List */}
            <div className="flex flex-col gap-3">
              {topics.map((topic) => (
                <LearningCard
                  key={topic.id}
                  title={topic.title}
                  category={topic.category}
                  progress={topic.progress}
                  status={topic.status}
                />
              ))}

              {topics.length === 0 && (
                <EmptyState
                  icon={FolderOpen}
                  title="No Subjects Registered"
                  description="Register study subjects or courses to begin tracking."
                />
              )}
            </div>
          </motion.div>
        )}

        {/* STUDY NOTES TAB */}
        {activeTab === "notes" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Quick Add Note Form */}
            <form onSubmit={handleAddNote} className="p-4 border border-border bg-card rounded-2xl flex flex-col gap-3">
              <h3 className="font-bold text-foreground text-sm">Add Lecture Note</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Note Title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                >
                  <option value="">Select Topic Link</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.title}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Write study notes (Markdown supported)..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground min-h-[96px]"
                required
              />
              <button type="submit" className="h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/95 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Save Note
              </button>
            </form>

            {/* Note Cards */}
            <div className="flex flex-col gap-3">
              {notes.map((note) => (
                <div key={note.id} className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3 shadow-md">
                  <div>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">{note.topicTitle}</span>
                    <h4 className="font-bold text-foreground mt-0.5 text-base">{note.title}</h4>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed bg-background/20 p-3.5 rounded-xl border border-border/50">
                    {note.content}
                  </p>
                  <div className="flex gap-1.5 mt-1">
                    {note.tags.map((tag) => (
                      <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full border border-border text-muted-foreground flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {notes.length === 0 && (
                <EmptyState
                  icon={FileText}
                  title="No Notes Logged"
                  description="Capture and record study observations here."
                />
              )}
            </div>
          </motion.div>
        )}

        {/* BOOKMARKS TAB */}
        {activeTab === "bookmarks" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Quick Add Bookmark Form */}
            <form onSubmit={handleAddBookmark} className="p-4 border border-border bg-card rounded-2xl flex flex-col gap-3">
              <h3 className="font-bold text-foreground text-sm">Add Resource Link</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Resource / Page Title"
                  value={newBookmarkTitle}
                  onChange={(e) => setNewBookmarkTitle(e.target.value)}
                  className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
                <input
                  type="url"
                  placeholder="https://..."
                  value={newBookmarkUrl}
                  onChange={(e) => setNewBookmarkUrl(e.target.value)}
                  className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Description summary..."
                value={newBookmarkDesc}
                onChange={(e) => setNewBookmarkDesc(e.target.value)}
                className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
              <button type="submit" className="h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/95 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Bookmark URL
              </button>
            </form>

            {/* Bookmark Cards */}
            <div className="flex flex-col gap-2.5">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-[9px] px-2 py-0.5 rounded-full border border-border text-muted-foreground font-medium uppercase tracking-wider bg-background/50">
                      {bookmark.category}
                    </span>
                    <h4 className="font-bold text-foreground text-sm truncate mt-2">{bookmark.title}</h4>
                    {bookmark.description && (
                      <p className="text-xs text-muted-foreground truncate mt-1">{bookmark.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary p-2 transition-colors flex items-center justify-center"
                      aria-label="Open bookmark link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                      className="text-muted-foreground hover:text-destructive p-2 transition-colors cursor-pointer"
                      aria-label="Delete bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {bookmarks.length === 0 && (
                <EmptyState
                  icon={LinkIcon}
                  title="No Bookmarks Saved"
                  description="Save references, document URLs, and articles here."
                />
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
