import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  action,
}: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center w-full gap-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border flex items-center justify-center">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
