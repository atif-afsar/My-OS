import { Star, Tag, Trash2 } from "lucide-react";

interface NoteCardProps {
  category: string;
  title: string;
  content: string;
  tags: string[];
  favorite?: boolean;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

export default function NoteCard({
  category,
  title,
  content,
  tags,
  favorite,
  onToggleFavorite,
  onDelete,
}: NoteCardProps) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3 shadow-md relative w-full">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
            {category}
          </span>
          <h4 className="font-bold text-foreground mt-0.5 text-base">{title}</h4>
        </div>
        <div className="flex items-center gap-1">
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

      <p className="text-sm text-foreground/90 leading-relaxed bg-background/20 p-3.5 rounded-xl border border-border/50">
        {content}
      </p>

      {tags.length > 0 && (
        <div className="flex gap-1.5 mt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-2 py-0.5 rounded-full border border-border text-muted-foreground flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
