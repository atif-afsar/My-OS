import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 border border-border bg-card rounded-2xl p-6 flex flex-col items-center gap-3 w-full">
      <Icon className="w-10 h-10 text-muted-foreground" />
      <h4 className="font-bold text-foreground text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
