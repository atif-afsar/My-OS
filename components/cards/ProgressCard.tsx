interface ProgressCardProps {
  label: string;
  completed: number;
  total: number;
  color?: string;
}

export default function ProgressCard({
  label,
  completed,
  total,
  color = "bg-primary",
}: ProgressCardProps) {
  const pct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {completed}/{total} tasks
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
