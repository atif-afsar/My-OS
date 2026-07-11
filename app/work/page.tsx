"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Plus,
  Calendar,
  Layers,
  FileText,
  Users,
  CheckCircle,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import TaskCard, { Task } from "@/components/cards/TaskCard";
import EmptyState from "@/components/common/EmptyState";
import ProgressCard from "@/components/cards/ProgressCard";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { useAuthStore } from "@/stores/auth.store";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "Planning" | "In Progress" | "Completed";
  progress: number;
  taskCount: number;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  attendees: string;
  notes: string;
}

export default function WorkPage() {
  const [activeTab, setActiveTab] = useState<"tasks" | "projects" | "log" | "meetings">("tasks");
  const [loading, setLoading] = useState(true);

  // Auth Store
  const { user } = useAuthStore();
  const authHeaders: Record<string, string> = user?.id ? { "x-user-id": user.id } : {};

  // States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Task["priority"]>("Medium");
  const [taskFilter, setTaskFilter] = useState<Task["status"] | "All">("All");

  const [logs, setLogs] = useState<string[]>([
    "Completed the Phase 1 Foundation layout structures.",
    "Integrated Tailwind CSS v4 variables with shadcn/ui components.",
    "Created temporary setup to move file imports to root.",
  ]);
  const [newLogText, setNewLogText] = useState("");

  const [meetings] = useState<Meeting[]>([
    { id: "1", title: "BrandsWay Sync", date: "2026-07-10", attendees: "Client, Dev Team", notes: "Discussed landing page design feedback and deployment pipeline." },
    { id: "2", title: "Database Architecture", date: "2026-07-08", attendees: "Self", notes: "Mapped out relationships between user, tasks, teaching lessons, and workouts." },
  ]);

  // Load Data
  useEffect(() => {
    async function loadData() {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          fetch("/api/tasks", { headers: authHeaders }),
          fetch("/api/projects", { headers: authHeaders }),
        ]);
        const tasksData = await tasksRes.json();
        const projectsData = await projectsRes.json();

        if (Array.isArray(tasksData)) setTasks(tasksData);
        if (Array.isArray(projectsData)) {
          setProjects(
            projectsData.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description || "",
              status: p.status,
              taskCount: p.tasks?.length || 0,
              progress: p.tasks?.length
                ? Math.round(
                    (p.tasks.filter((t: any) => t.status === "Completed").length /
                      p.tasks.length) *
                      100
                  )
                : 0,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load work data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]); // reload when user logs in

  // Handlers
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          title: newTaskTitle,
          priority: newTaskPriority,
          status: "Todo",
        }),
      });
      const data = await res.json();
      if (data.id) {
        setTasks([data, ...tasks]);
        setNewTaskTitle("");
        
        // Log activity to timeline
        await fetch("/api/timeline", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            type: "Work",
            title: `Added Task: ${data.title}`,
            description: `Priority: ${data.priority}`,
            referenceId: data.id,
            referenceType: "Task",
          }),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTaskStatus = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const nextStatusMap: Record<Task["status"], Task["status"]> = {
      Todo: "In Progress",
      "In Progress": "Completed",
      Completed: "Todo",
    };
    const nextStatus = nextStatusMap[task.status];

    try {
      setTasks(tasks.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));

      const res = await fetch(`/app/api/tasks/${id}`.replace("/app", ""), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();

      if (data.id) {
        if (nextStatus === "Completed") {
          await fetch("/api/timeline", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders,
            },
            body: JSON.stringify({
              type: "Work",
              title: `Completed task: ${data.title}`,
              description: "Persisted to database",
              referenceId: data.id,
              referenceType: "Task",
            }),
          });
        }
      }
    } catch (err) {
      console.error(err);
      setTasks(tasks.map((t) => (t.id === id ? { ...t, status: task.status } : t)));
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setTasks(tasks.filter((t) => t.id !== id));

      await fetch(`/app/api/tasks/${id}`.replace("/app", ""), {
        method: "DELETE",
        headers: authHeaders,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim()) return;
    setLogs([newLogText, ...logs]);
    setNewLogText("");
  };

  const filteredTasks = tasks.filter((t) => taskFilter === "All" || t.status === taskFilter);

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <PageHeader
        title="Work Module"
        description="Manage client work, tasks, and daily logs."
        icon={Briefcase}
        iconColor="text-blue-500"
      />

      {/* Tabs */}
      <div className="flex border-b border-border text-sm overflow-x-auto scrollbar-none gap-2">
        {(
          [
            { id: "tasks", label: "Tasks", icon: CheckCircle },
            { id: "projects", label: "Projects", icon: Layers },
            { id: "log", label: "Daily Log", icon: FileText },
            { id: "meetings", label: "Meetings", icon: Users },
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
        {loading ? (
          <LoadingSkeleton variant="card" count={3} />
        ) : (
          <>
            {/* TASKS TAB */}
            {activeTab === "tasks" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
              >
                {/* Quick Add Task */}
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a new work task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 px-4 h-11 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  />
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Task["priority"])}
                    className="px-3 h-11 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                  <button
                    type="submit"
                    className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </form>

                {/* Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                  {(["All", "Todo", "In Progress", "Completed"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTaskFilter(filter)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        (filter === "All" && taskFilter === "All") || taskFilter === filter
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Task List */}
                <div className="flex flex-col gap-2.5">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleTaskStatus}
                      onDelete={handleDeleteTask}
                    />
                  ))}

                  {filteredTasks.length === 0 && (
                    <EmptyState
                      icon={CheckCircle}
                      title="No Tasks Found"
                      description="All tasks matching this filter are completed or cleared."
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* PROJECTS TAB */}
            {activeTab === "projects" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3.5 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-foreground text-sm">{project.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          project.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : project.status === "In Progress"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="border-t border-border/50 pt-3">
                      <ProgressCard
                        label="Project Progress"
                        completed={Math.round((project.progress / 100) * project.taskCount)}
                        total={project.taskCount}
                        color="bg-primary"
                      />
                    </div>
                  </div>
                ))}

                {projects.length === 0 && (
                  <EmptyState
                    icon={Layers}
                    title="No Projects Registered"
                    description="Create projects to begin organizing work tasks."
                  />
                )}
              </motion.div>
            )}

            {/* DAILY LOG TAB */}
            {activeTab === "log" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
              >
                <form onSubmit={handleAddLog} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Log what you worked on today..."
                    value={newLogText}
                    onChange={(e) => setNewLogText(e.target.value)}
                    className="flex-1 px-4 h-11 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    className="px-4 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Log
                  </button>
                </form>

                <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
                  <h3 className="font-bold text-foreground">Today's Work Log</h3>
                  <div className="flex flex-col gap-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                    {logs.map((log, idx) => (
                      <div key={idx} className="flex gap-4 items-start relative pl-6">
                        <div className="absolute left-[3px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                        <p className="text-sm text-foreground leading-relaxed">{log}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* MEETINGS TAB */}
            {activeTab === "meetings" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-foreground">{meeting.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {meeting.date}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {meeting.attendees}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
                        Notes
                      </span>
                      <p className="text-sm text-foreground mt-1 leading-relaxed">{meeting.notes}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
