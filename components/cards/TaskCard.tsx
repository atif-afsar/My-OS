import { CheckCircle, Calendar, Trash2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: "Todo" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  dueDate: string;
}

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({
  task,
  onToggleStatus,
  onDelete,
}: TaskCardProps) {
  const getPriorityColor = (p: Task["priority"]) => {
    const colors = {
      Low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      Medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      Urgent: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return colors[p];
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors w-full">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <button
          onClick={() => onToggleStatus(task.id)}
          className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            task.status === "Completed"
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/40 bg-background"
          }`}
        >
          {task.status === "Completed" && (
            <CheckCircle className="w-4 h-4 fill-current" />
          )}
        </button>
        <div className="flex flex-col min-w-0">
          <span
            className={`text-sm font-medium truncate ${
              task.status === "Completed"
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {task.title}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {task.dueDate}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-muted-foreground hover:text-destructive p-2 transition-colors cursor-pointer shrink-0"
        aria-label="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
export type { Task };
