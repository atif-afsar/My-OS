"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Calendar,
  CheckCircle,
  Plus,
  Trash2,
  List,
  Flame,
  Award,
} from "lucide-react";

interface Exercise {
  name: string;
  targetSets: number;
  targetReps: number;
}

interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
}

interface SetLog {
  id: string;
  exerciseName: string;
  setIndex: number;
  reps: number;
  weight: number;
  completed: boolean;
}

interface WorkoutHistoryRecord {
  id: string;
  routineName: string;
  date: string;
  duration: string;
  summary: string;
}

export default function GymPage() {
  const [activeTab, setActiveTab] = useState<"routines" | "tracker" | "history">("routines");

  // Local state for Routines
  const [routines] = useState<Routine[]>([
    {
      id: "1",
      name: "Push Day Routine",
      description: "Focus on chest, shoulders, and triceps strength.",
      exercises: [
        { name: "Incline Dumbbell Press", targetSets: 4, targetReps: 8 },
        { name: "Overhead Barbell Press", targetSets: 3, targetReps: 10 },
        { name: "Weighted Chest Dips", targetSets: 3, targetReps: 12 },
        { name: "Overhead Tricep Extension", targetSets: 3, targetReps: 12 },
      ],
    },
    {
      id: "2",
      name: "Pull Day Routine",
      description: "Focus on back thickness, width, and biceps.",
      exercises: [
        { name: "Weighted Pull-ups", targetSets: 4, targetReps: 6 },
        { name: "Barbell Rows", targetSets: 4, targetReps: 8 },
        { name: "Lat Pulldown (Neutral)", targetSets: 3, targetReps: 10 },
        { name: "Incline Bicep Curls", targetSets: 3, targetReps: 12 },
      ],
    },
  ]);

  // Local state for Active Workout Tracker
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [trackerSets, setTrackerSets] = useState<SetLog[]>([]);
  const [exerciseInputs, setExerciseInputs] = useState<{ [key: string]: { reps: string; weight: string } }>({});

  // Local state for History
  const [history, setHistory] = useState<WorkoutHistoryRecord[]>([
    { id: "1", routineName: "Push Day Routine", date: "2026-07-09", duration: "55m", summary: "4 exercises, 13 sets logged" },
    { id: "2", routineName: "Pull Day Routine", date: "2026-07-07", duration: "60m", summary: "4 exercises, 14 sets logged" },
  ]);

  // Start Workout Handlers
  const handleStartWorkout = (routine: Routine) => {
    setSelectedRoutine(routine);
    setActiveTab("tracker");

    // Initialize tracking sets for all exercises in the routine
    const initialSets: SetLog[] = [];
    const initialInputs: typeof exerciseInputs = {};

    routine.exercises.forEach((ex) => {
      // Default input weight/reps
      initialInputs[ex.name] = { reps: ex.targetReps.toString(), weight: "20" };

      for (let i = 0; i < ex.targetSets; i++) {
        initialSets.push({
          id: `${ex.name}-${i}`,
          exerciseName: ex.name,
          setIndex: i + 1,
          reps: ex.targetReps,
          weight: 20,
          completed: false,
        });
      }
    });

    setTrackerSets(initialSets);
    setExerciseInputs(initialInputs);
  };

  const handleToggleSetComplete = (setId: string) => {
    setTrackerSets(
      trackerSets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleUpdateSetInputs = (exerciseName: string, field: "reps" | "weight", value: string) => {
    const updatedInputs = {
      ...exerciseInputs,
      [exerciseName]: {
        ...exerciseInputs[exerciseName],
        [field]: value,
      },
    };
    setExerciseInputs(updatedInputs);

    // Apply to all uncompleted sets for this exercise
    setTrackerSets(
      trackerSets.map((s) => {
        if (s.exerciseName === exerciseName && !s.completed) {
          return {
            ...s,
            reps: field === "reps" ? parseInt(value) || 0 : s.reps,
            weight: field === "weight" ? parseFloat(value) || 0 : s.weight,
          };
        }
        return s;
      })
    );
  };

  const handleFinishWorkout = () => {
    if (!selectedRoutine) return;

    const completedSetsCount = trackerSets.filter((s) => s.completed).length;
    const totalSetsCount = trackerSets.length;

    const newRecord: WorkoutHistoryRecord = {
      id: Date.now().toString(),
      routineName: selectedRoutine.name,
      date: new Date().toISOString().split("T")[0],
      duration: "45m",
      summary: `${completedSetsCount}/${totalSetsCount} sets completed`,
    };

    setHistory([newRecord, ...history]);
    setSelectedRoutine(null);
    setTrackerSets([]);
    setActiveTab("history");
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
          <Dumbbell className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Gym Module</h2>
          <p className="text-sm text-muted-foreground">Track routines, workouts, sets, and personal records.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-sm overflow-x-auto scrollbar-none gap-2">
        {(
          [
            { id: "routines", label: "Routines", icon: List },
            { id: "tracker", label: "Workout Tracker", icon: Flame },
            { id: "history", label: "History Log", icon: Calendar },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex flex-col gap-4">
        {/* ROUTINES TAB */}
        {activeTab === "routines" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              {routines.map((routine) => (
                <div key={routine.id} className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-4 shadow-sm">
                  <div>
                    <h4 className="font-bold text-foreground text-base">{routine.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{routine.description}</p>
                  </div>

                  <div className="border-t border-border pt-3.5">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-2">Exercises Included</span>
                    <div className="flex flex-col gap-2">
                      {routine.exercises.map((ex, idx) => (
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
                    onClick={() => handleStartWorkout(routine)}
                    className="w-full h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/95 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-1"
                  >
                    <Flame className="w-4 h-4 fill-current" />
                    Start This Workout
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TRACKER TAB */}
        {activeTab === "tracker" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {!selectedRoutine ? (
              <div className="text-center py-12 border border-border bg-card rounded-2xl p-6 flex flex-col items-center gap-3">
                <Dumbbell className="w-10 h-10 text-muted-foreground" />
                <h4 className="font-bold text-foreground text-sm">No Active Workout Session</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Choose a routine from the 'Routines' tab and start your workout to log sets in real-time.
                </p>
                <button
                  onClick={() => setActiveTab("routines")}
                  className="px-4 h-9 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/95 transition-all cursor-pointer mt-1"
                >
                  Browse Routines
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Active Session Header */}
                <div className="p-4 border border-primary/20 bg-primary/5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">Session Active</span>
                    <h3 className="font-bold text-foreground text-base">{selectedRoutine.name}</h3>
                  </div>
                  <button
                    onClick={handleFinishWorkout}
                    className="px-4 h-9 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    Finish Workout
                  </button>
                </div>

                {/* Exercises Group and set checks */}
                {selectedRoutine.exercises.map((exercise) => {
                  const exSets = trackerSets.filter((s) => s.exerciseName === exercise.name);
                  const inputs = exerciseInputs[exercise.name] || { reps: "10", weight: "20" };

                  return (
                    <div key={exercise.name} className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3.5 shadow-sm">
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <h4 className="font-bold text-foreground text-sm">{exercise.name}</h4>
                        {/* Target values */}
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">Reps:</span>
                            <input
                              type="number"
                              value={inputs.reps}
                              onChange={(e) => handleUpdateSetInputs(exercise.name, "reps", e.target.value)}
                              className="w-10 h-7 bg-background border border-border rounded-md text-xs text-center focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">kg:</span>
                            <input
                              type="number"
                              value={inputs.weight}
                              onChange={(e) => handleUpdateSetInputs(exercise.name, "weight", e.target.value)}
                              className="w-12 h-7 bg-background border border-border rounded-md text-xs text-center focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sets list */}
                      <div className="flex flex-col gap-2 mt-1">
                        {exSets.map((set, sIdx) => (
                          <div key={set.id} className="flex justify-between items-center bg-background/40 p-2.5 rounded-lg border border-border/50 text-xs">
                            <span className="font-semibold text-muted-foreground">Set {set.setIndex}</span>
                            <span className="text-foreground/90 font-medium">
                              {set.reps} reps @ {set.weight} kg
                            </span>
                            <button
                              onClick={() => handleToggleSetComplete(set.id)}
                              className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                                set.completed
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/30 hover:border-foreground"
                              }`}
                            >
                              {set.completed && <CheckCircle className="w-4 h-4 fill-current" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            {/* Personal Records Summary Widget */}
            <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">Personal Records logged</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Incline Press: 24kg dumbbells (4 sets of 8)</p>
              </div>
            </div>

            {/* List history logs */}
            {history.map((record) => (
              <div key={record.id} className="p-4 rounded-xl border border-border bg-card flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{record.routineName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {record.date}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-[10px] text-muted-foreground">{record.summary}</span>
                  </div>
                </div>
                <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  {record.duration}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
