interface LearningCardProps {
  title: string;
  category: string;
  progress: number;
  status: string;
}

export default function LearningCard({
  title,
  category,
  progress,
  status,
}: LearningCardProps) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card flex flex-col gap-3 shadow-sm w-full">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-foreground text-sm">{title}</h4>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">
            {category}
          </span>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
            status === "Mastered"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : status === "Learning"
              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
