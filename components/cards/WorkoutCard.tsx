import { Flame } from "lucide-react";

interface Exercise {
  name: string;
  targetSets: number;
  targetReps: number;
}

interface WorkoutCardProps {
  name: string;
  description: string;
  exercises: Exercise[];
  onStart: () => void;
}

export default function WorkoutCard({
  name,
  description,
  exercises,
  onStart,
}: WorkoutCardProps) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4 shadow-sm w-full">
      <div>
        <h4 className="font-bold text-foreground text-base">{name}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>

      <div className="border-t border-border pt-3.5">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-2">
          Exercises Included
        </span>
        <div className="flex flex-col gap-2">
          {exercises.map((ex, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-foreground/90 font-medium">{ex.name}</span>
              <span className="text-xs text-muted-foreground bg-secondary/40 px-2 py-0.5 rounded-md border border-border">
                {ex.targetSets} sets × {ex.targetReps} reps
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/95 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-1"
      >
        <Flame className="w-4 h-4 fill-current" />
        Start This Workout
      </button>
    </div>
  );
}
export type { Exercise };
