"use client";

import { useState, useEffect } from "react";
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
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

interface LearningTopic {
  id: string;
  title: string;
  category: "AI" | "Programming" | "Business" | "Marketing" | "Design" | "Books";
  progress: number;
  status: "Not Started" | "Learning" | "Mastered";
}

interface LearningNote {
  id: string;
  topicId: string;
  topic?: LearningTopic;
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
  const [loading, setLoading] = useState(true);

  // States
  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState<LearningTopic["category"]>("AI");

  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const [newBookmarkTitle, setNewBookmarkTitle] = useState("");
  const [newBookmarkUrl, setNewBookmarkUrl] = useState("");
  const [newBookmarkDesc, setNewBookmarkDesc] = useState("");

  // Load Data
  useEffect(() => {
    async function loadData() {
      try {
        const [topRes, notRes, bmkRes] = await Promise.all([
          fetch("/api/learning/topics"),
          fetch("/api/learning/notes"),
          fetch("/api/learning/bookmarks"),
        ]);
        const topData = await topRes.json();
        const notData = await notRes.json();
        const bmkData = await bmkRes.json();

        if (Array.isArray(topData)) setTopics(topData);
        if (Array.isArray(notData)) setNotes(notData);
        if (Array.isArray(bmkData)) setBookmarks(bmkData);
      } catch (err) {
        console.error("Failed to load learning data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "bookmarks") {
        setActiveTab("bookmarks");
      } else if (tab === "notes") {
        setActiveTab("notes");
      }
    }
  }, []);

  // Handlers
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    try {
      const res = await fetch("/api/learning/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTopicTitle,
          category: newTopicCategory,
          progress: 0,
          status: "Not Started",
        }),
      });
      const data = await res.json();
      if (data.id) {
        setTopics([...topics, data]);
        setNewTopicTitle("");

        // Log to timeline
        await fetch("/api/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "Learning",
            title: `Added Study Subject: ${data.title}`,
            description: `Category: ${data.category}`,
            referenceId: data.id,
            referenceType: "LearningTopic",
          }),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim() || !selectedTopicId) return;

    try {
      const res = await fetch("/api/learning/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicId,
          title: newNoteTitle,
          content: newNoteContent,
          tags: ["StudyNotes"],
        }),
      });
      const data = await res.json();
      if (data.id) {
        setNotes([data, ...notes]);
        setNewNoteTitle("");
        setNewNoteContent("");

        // Log to timeline
        await fetch("/api/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "Learning",
            title: `Wrote Study Note: ${data.title}`,
            description: `Subject: ${data.topic?.title || "General"}`,
            referenceId: data.id,
            referenceType: "LearningNote",
          }),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      setTopics(topics.filter((t) => t.id !== id));
      await fetch(`/api/learning/topics?id=${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      setNotes(notes.filter((n) => n.id !== id));
      await fetch(`/api/learning/notes?id=${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmarkTitle.trim() || !newBookmarkUrl.trim()) return;

    try {
      const res = await fetch("/api/learning/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBookmarkTitle,
          url: newBookmarkUrl,
          description: newBookmarkDesc,
          category: "Resource",
        }),
      });
      const data = await res.json();
      if (data.id) {
        setBookmarks([data, ...bookmarks]);
        setNewBookmarkTitle("");
        setNewBookmarkUrl("");
        setNewBookmarkDesc("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      // Optimistic update
      setBookmarks(bookmarks.filter((b) => b.id !== id));
      await fetch(`/api/learning/bookmarks?id=${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
    }
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
        {loading ? (
          <LoadingSkeleton variant="card" count={2} />
        ) : (
          <>
            {/* SUBJECTS TAB */}
            {activeTab === "topics" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
              >
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

                <div className="flex flex-col gap-3">
                  {topics.map((topic) => (
                    <LearningCard
                      key={topic.id}
                      title={topic.title}
                      category={topic.category}
                      progress={topic.progress}
                      status={topic.status}
                      onDelete={() => handleDeleteTopic(topic.id)}
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
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      required
                    >
                      <option value="">Select Topic Link</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
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

                <div className="flex flex-col gap-3">
                  {notes.map((note) => (
                    <div key={note.id} className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3 shadow-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">{note.topic?.title || "General"}</span>
                          <h4 className="font-bold text-foreground mt-0.5 text-base">{note.title}</h4>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-muted-foreground hover:text-destructive p-1 transition-colors cursor-pointer"
                          aria-label="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed bg-background/20 p-3.5 rounded-xl border border-border/50">
                        {note.content}
                      </p>
                      {note.tags.length > 0 && (
                        <div className="flex gap-1.5 mt-1">
                          {note.tags.map((tag) => (
                            <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full border border-border text-muted-foreground flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
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

                <div className="flex flex-col gap-2.5">
                  {bookmarks.map((bookmark) => (
                    <div key={bookmark.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="text-[9px] px-2 py-0.5 rounded-full border border-border text-muted-foreground font-medium uppercase tracking-wider bg-background/50">
                          {bookmark.category || "Resource"}
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
          </>
        )}
      </div>
    </div>
  );
}
