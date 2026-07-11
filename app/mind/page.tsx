"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Search,
  Plus,
  BookOpen,
  Quote,
  Compass,
  Heart,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import NoteCard from "@/components/cards/NoteCard";
import EmptyState from "@/components/common/EmptyState";
import SectionHeader from "@/components/common/SectionHeader";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: "Philosophy" | "Ideas" | "Quotes" | "Islamic Notes" | "Reflections";
  tags: string[];
  favorite: boolean;
  date: string;
}

export default function MindPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeItem["category"] | "All">("All");
  const [loading, setLoading] = useState(true);

  // States
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<KnowledgeItem["category"]>("Philosophy");
  const [showAddForm, setShowAddForm] = useState(false);

  // Load Data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/knowledge");
        const data = await res.json();
        if (Array.isArray(data)) {
          setItems(
            data.map((item: any) => ({
              id: item.id,
              title: item.title,
              content: item.content,
              category: item.category,
              tags: item.tags || [item.category.toLowerCase()],
              favorite: item.favorite,
              date: new Date(item.createdAt).toISOString().split("T")[0],
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load knowledge notes", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleToggleFavorite = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      // Optimistic update
      setItems(
        items.map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i))
      );

      await fetch("/api/knowledge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, favorite: !item.favorite }),
      });
    } catch (err) {
      console.error(err);
      // Rollback
      setItems(
        items.map((i) => (i.id === id ? { ...i, favorite: item.favorite } : i))
      );
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          favorite: false,
        }),
      });
      const data = await res.json();
      if (data.id) {
        const mappedItem: KnowledgeItem = {
          id: data.id,
          title: data.title,
          content: data.content,
          category: data.category as KnowledgeItem["category"],
          tags: [data.category.toLowerCase()],
          favorite: data.favorite,
          date: new Date(data.createdAt).toISOString().split("T")[0],
        };
        setItems([mappedItem, ...items]);
        setNewTitle("");
        setNewContent("");
        setShowAddForm(false);

        // Log to timeline
        await fetch("/api/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "Mind",
            title: `Added Knowledge: ${data.title}`,
            description: `Category: ${data.category}`,
            referenceId: data.id,
            referenceType: "Knowledge",
          }),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      // Optimistic update
      setItems(items.filter((i) => i.id !== id));
      await fetch(`/api/knowledge?id=${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Categories with Icons
  const categories: { label: KnowledgeItem["category"] | "All"; icon: any; color: string }[] = [
    { label: "All", icon: Compass, color: "text-slate-400" },
    { label: "Philosophy", icon: BookOpen, color: "text-purple-400" },
    { label: "Ideas", icon: LightbulbIcon, color: "text-amber-400" },
    { label: "Quotes", icon: Quote, color: "text-blue-400" },
    { label: "Islamic Notes", icon: Heart, color: "text-emerald-400" },
    { label: "Reflections", icon: Brain, color: "text-pink-400" },
  ];

  function LightbulbIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    );
  }

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <PageHeader
        title="Mind Module"
        description="Personal second brain, philosophy notes, and reflections."
        icon={Brain}
        iconColor="text-pink-500"
      />

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search philosophy, quotes, reflection logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 h-11 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.label;
          return (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`text-xs px-3.5 py-2 rounded-full border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-current" : cat.color}`} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content area */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <LoadingSkeleton variant="card" count={2} />
        ) : (
          <>
            {/* Toggle Form / Header */}
            <SectionHeader
              title={selectedCategory === "All" ? "All Notes" : `${selectedCategory} Collection`}
              badge={
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                  {filteredItems.length}
                </span>
              }
              action={
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Knowledge
                </button>
              }
            />

            {/* Add Form */}
            {showAddForm && (
              <form onSubmit={handleAddItem} className="p-4 border border-border bg-card rounded-2xl flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Title (e.g. Meditations Book 1)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
                <div className="flex gap-2">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as KnowledgeItem["category"])}
                    className="flex-1 px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="Philosophy">Philosophy</option>
                    <option value="Ideas">Ideas</option>
                    <option value="Quotes">Quotes</option>
                    <option value="Islamic Notes">Islamic Notes</option>
                    <option value="Reflections">Reflections</option>
                  </select>
                </div>
                <textarea
                  placeholder="Write content notes (Markdown format)..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground min-h-[96px]"
                  required
                />
                <button type="submit" className="h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/95 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" /> Save to Second Brain
                </button>
              </form>
            )}

            {/* Knowledge Items Grid */}
            <div className="flex flex-col gap-3.5">
              {filteredItems.map((item) => (
                <NoteCard
                  key={item.id}
                  category={item.category}
                  title={item.title}
                  content={item.content}
                  tags={item.tags}
                  favorite={item.favorite}
                  onToggleFavorite={() => handleToggleFavorite(item.id)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}

              {filteredItems.length === 0 && (
                <EmptyState
                  icon={Brain}
                  title="No Knowledge Notes Found"
                  description="Record philosophy notes, book quotes, or daily reflections to build your brain."
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
