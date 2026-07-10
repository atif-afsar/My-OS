import {
  Briefcase,
  GraduationCap,
  BookOpen,
  Dumbbell,
  Brain,
  Clock,
} from "lucide-react";

interface TimelineCardProps {
  type: "Work" | "Teaching" | "Learning" | "Gym" | "Mind" | "General";
  title: string;
  description: string;
  time: string;
}

export default function TimelineCard({
  type,
  title,
  description,
  time,
}: TimelineCardProps) {
  const getEventIcon = (t: typeof type) => {
    const icons = {
      Work: Briefcase,
      Teaching: GraduationCap,
      Learning: BookOpen,
      Gym: Dumbbell,
      Mind: Brain,
      General: Clock,
    };
    const IconComponent = icons[t] || Clock;
    return <IconComponent className="w-4 h-4" />;
  };

  const getEventBadgeStyles = (t: typeof type) => {
    const styles = {
      Work: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Teaching: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Learning: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Gym: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      Mind: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      General: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    return styles[t] || styles.General;
  };

  return (
    <div className="flex gap-4 items-center bg-card p-3.5 rounded-xl border border-border/80 hover:bg-secondary/40 transition-colors shadow-sm w-full">
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${getEventBadgeStyles(
          type
        )}`}
      >
        {getEventIcon(type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-2">
          <h4 className="font-bold text-sm text-foreground truncate">{title}</h4>
          <span className="text-[10px] text-muted-foreground shrink-0">{time}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">
          {description}
        </p>
      </div>
    </div>
  );
}
