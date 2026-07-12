import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Star, Tag, Trash2, Link2, Brain, BookOpen, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";

interface NoteCardProps {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  favorite?: boolean;
  allItems?: any[];
  learningTopics?: any[];
  isFocused?: boolean;
  onSelectNote?: (id: string) => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

export default function NoteCard({
  id,
  category,
  title,
  content,
  tags,
  favorite,
  allItems = [],
  learningTopics = [],
  isFocused = false,
  onSelectNote,
  onToggleFavorite,
  onDelete,
}: NoteCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [showConnections, setShowConnections] = useState(false);

  // Scroll card into view if it becomes focused via network clicks
  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isFocused]);

  // 1. Calculate Backlinks (where other notes mention this note's title or have [[title]])
  const backlinks = allItems.filter((item) => {
    if (item.id === id) return false;
    const contentLower = item.content.toLowerCase();
    const titleLower = title.toLowerCase();
    return contentLower.includes(`[[${titleLower}]]`) || contentLower.includes(titleLower);
  });

  // 2. Calculate Related Notes (sharing tags or category)
  const relatedNotes = allItems.filter((item) => {
    if (item.id === id) return false;
    const sharesTag = item.tags.some((t: string) => tags.includes(t));
    const sharesCategory = item.category === category;
    return sharesTag || sharesCategory;
  });

  // 3. Calculate Related Learning Topics (where note tags match learning categories/titles)
  const relatedLearning = learningTopics.filter((topic) => {
    const topicTitleLower = topic.title.toLowerCase();
    const topicCatLower = topic.category.toLowerCase();
    return (
      content.toLowerCase().includes(topicTitleLower) ||
      tags.some((t) => topicTitleLower.includes(t.toLowerCase())) ||
      tags.some((t) => topicCatLower.includes(t.toLowerCase()))
    );
  });

  // WikiLink parser: replaces [[Note Title]] with clickable trigger spans
  const parseWikiLinks = (txt: string) => {
    if (!txt) return "";
    const parts = txt.split(/(\[\[.*?\]\])/g);
    return parts.map((part, index) => {
      if (part.startsWith("[[") && part.endsWith("]]")) {
        const targetTitle = part.slice(2, -2).trim();
        const match = allItems.find(
          (item) => item.title.toLowerCase() === targetTitle.toLowerCase()
        );
        if (match) {
          return (
            <button
              key={index}
              onClick={() => onSelectNote?.(match.id)}
              className="text-primary hover:underline font-bold inline-block mx-0.5 cursor-pointer"
            >
              {targetTitle}
            </button>
          );
        }
        return (
          <span key={index} className="text-muted-foreground/60 italic">
            {targetTitle}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const totalConnections = backlinks.length + relatedNotes.length + relatedLearning.length;

  return (
    <div
      ref={cardRef}
      className={`p-5 rounded-2xl border transition-all flex flex-col gap-3 shadow-md relative w-full ${
        isFocused
          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
            {category}
          </span>
          <h4 className="font-bold text-foreground mt-0.5 text-base">{title}</h4>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-4">
          {/* Network Connections Toggle */}
          <button
            onClick={() => setShowConnections(!showConnections)}
            className={`p-1.5 rounded-full hover:bg-secondary transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
              showConnections || totalConnections > 0 ? "text-violet-400" : "text-muted-foreground"
            }`}
            title="Show Knowledge connections"
          >
            <Link2 className="w-4 h-4" />
            {totalConnections > 0 && <span>{totalConnections}</span>}
          </button>

          {/* Favorite Toggle */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-full hover:bg-secondary transition-colors cursor-pointer ${
                favorite ? "text-amber-400" : "text-muted-foreground"
              }`}
              aria-label="Toggle favorite"
            >
              <Star className={`w-4 h-4 ${favorite ? "fill-current" : ""}`} />
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              aria-label="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Note Content Section */}
      <div className="text-sm text-foreground/90 leading-relaxed bg-background/20 p-3.5 rounded-xl border border-border/50 whitespace-pre-wrap">
        {parseWikiLinks(content)}
      </div>

      {/* Tags Block */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-2 py-0.5 rounded-full border border-border text-muted-foreground flex items-center gap-1 bg-background/30"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Knowledge Connections Sub-panel */}
      {showConnections && (
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-3.5 bg-background/30 p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Knowledge Network Map
            </span>
          </div>

          {/* 1. Backlinks */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-pink-400 font-bold uppercase tracking-wider block">
              Backlinks (Mentioned In)
            </span>
            {backlinks.length > 0 ? (
              <div className="flex flex-col gap-1">
                {backlinks.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => onSelectNote?.(b.id)}
                    className="text-left text-xs text-foreground/80 hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 py-0.5"
                  >
                    <Brain className="w-3 h-3 text-pink-400/75 shrink-0" />
                    <span className="truncate hover:underline">{b.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground/60 italic pl-1">
                No active backlinks found. Add [[{title}]] in other notes to link them.
              </span>
            )}
          </div>

          {/* 2. Related Second Brain Notes */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wider block">
              Related Second Brain Notes
            </span>
            {relatedNotes.length > 0 ? (
              <div className="flex flex-col gap-1">
                {relatedNotes.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelectNote?.(r.id)}
                    className="text-left text-xs text-foreground/80 hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 py-0.5"
                  >
                    <Link2 className="w-3 h-3 text-violet-400/75 shrink-0" />
                    <span className="truncate hover:underline">{r.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground/60 italic pl-1">
                No related notes discovered.
              </span>
            )}
          </div>

          {/* 3. Connected Learning Paths */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">
              Connected Learning Paths
            </span>
            {relatedLearning.length > 0 ? (
              <div className="flex flex-col gap-1">
                {relatedLearning.slice(0, 3).map((l) => (
                  <button
                    key={l.id}
                    onClick={() => router.push(`/learning`)}
                    className="text-left text-xs text-foreground/80 hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 py-0.5"
                  >
                    <GraduationCap className="w-3 h-3 text-emerald-400/75 shrink-0" />
                    <span className="truncate hover:underline">{l.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground/60 italic pl-1">
                No connected study paths found.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
