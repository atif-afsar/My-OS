"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Phone,
  School,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SectionHeader from "@/components/common/SectionHeader";

interface Student {
  id: string;
  name: string;
  className: string;
  subject: string;
  school: string;
  parentName: string;
  phone: string;
  notes: string;
  attendance: "Present" | "Absent" | "Unmarked";
}

interface LessonRecord {
  id: string;
  studentName: string;
  date: string;
  topic: string;
  homework: string;
  remarks: string;
}

export default function TeachingPage() {
  const [activeTab, setActiveTab] = useState<"students" | "lessons" | "attendance">("students");

  // Local state for Students
  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      name: "Zayan Khan",
      className: "Class 10",
      subject: "Mathematics & Physics",
      school: "Beaconhouse School System",
      parentName: "Mr. Farhan Khan",
      phone: "+92 300 1234567",
      notes: "Needs extra focus on Algebra and Newton's Laws. Very responsive.",
      attendance: "Unmarked",
    },
    {
      id: "2",
      name: "Ayesha Ahmed",
      className: "Class 9",
      subject: "Chemistry & Biology",
      school: "The City School",
      parentName: "Mrs. Sana Ahmed",
      phone: "+92 321 9876543",
      notes: "Strong in biology concepts, struggles slightly with balancing equations.",
      attendance: "Unmarked",
    },
  ]);

  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("");
  const [newStudentSubject, setNewStudentSubject] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Local state for Lessons
  const [lessons, setLessons] = useState<LessonRecord[]>([
    {
      id: "1",
      studentName: "Zayan Khan",
      date: "2026-07-09",
      topic: "Introduction to Quadratic Equations",
      homework: "Exercise 4.1 Questions 1 to 10",
      remarks: "Understood the basic factorization method quickly.",
    },
    {
      id: "2",
      studentName: "Ayesha Ahmed",
      date: "2026-07-08",
      topic: "Atomic Structure & Chemical Bonding",
      homework: "Draw Bohr Models for first 10 elements",
      remarks: "Completed previous homework cleanly. Active listener.",
    },
  ]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newHomework, setNewHomework] = useState("");
  const [newRemarks, setNewRemarks] = useState("");

  // Handlers
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentClass.trim()) return;

    const newStudent: Student = {
      id: Date.now().toString(),
      name: newStudentName,
      className: newStudentClass,
      subject: newStudentSubject || "General Science",
      school: "Private Institution",
      parentName: "Parent Name",
      phone: "+92 000 0000000",
      notes: "Initial lesson profiling details.",
      attendance: "Unmarked",
    };

    setStudents([...students, newStudent]);
    setNewStudentName("");
    setNewStudentClass("");
    setNewStudentSubject("");
    setShowAddForm(false);
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newTopic.trim()) return;

    const newRecord: LessonRecord = {
      id: Date.now().toString(),
      studentName: selectedStudent,
      date: new Date().toISOString().split("T")[0],
      topic: newTopic,
      homework: newHomework,
      remarks: newRemarks,
    };

    setLessons([newRecord, ...lessons]);
    setNewTopic("");
    setNewHomework("");
    setNewRemarks("");
  };

  const handleToggleAttendance = (id: string, status: Student["attendance"]) => {
    setStudents(
      students.map((s) => (s.id === id ? { ...s, attendance: status } : s))
    );
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Header */}
      <PageHeader
        title="Teaching Module"
        description="Manage tuition students, lessons, and attendance."
        icon={GraduationCap}
        iconColor="text-emerald-500"
      />

      {/* Tabs */}
      <div className="flex border-b border-border text-sm overflow-x-auto scrollbar-none gap-2">
        {(
          [
            { id: "students", label: "Students", icon: Users },
            { id: "lessons", label: "Lesson Logs", icon: BookOpen },
            { id: "attendance", label: "Attendance", icon: CheckCircle },
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
        {/* STUDENTS TAB */}
        {activeTab === "students" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <SectionHeader
              title="Active Class List"
              action={
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Student
                </button>
              }
            />

            {showAddForm && (
              <form onSubmit={handleAddStudent} className="p-4 border border-border bg-card rounded-2xl flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Class (e.g. Class 10)"
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subjects (e.g. Maths)"
                    value={newStudentSubject}
                    onChange={(e) => setNewStudentSubject(e.target.value)}
                    className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <button type="submit" className="h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/95 transition-colors cursor-pointer">
                  Save Student Profile
                </button>
              </form>
            )}

            <div className="flex flex-col gap-3">
              {students.map((student) => (
                <div key={student.id} className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3.5 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-foreground text-base">{student.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-primary font-semibold">{student.className}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground font-medium">{student.subject}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.school}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.parentName} ({student.phone})</span>
                    </div>
                  </div>

                  <div className="bg-secondary/40 p-3 rounded-xl border border-border text-xs text-foreground leading-relaxed">
                    <span className="font-bold block mb-1 uppercase tracking-wider text-[10px] text-muted-foreground">Internal Profiling</span>
                    {student.notes}
                  </div>
                </div>
              ))}

              {students.length === 0 && (
                <EmptyState
                  icon={Users}
                  title="No Students Registered"
                  description="Register your tuition students here to manage logs."
                />
              )}
            </div>
          </motion.div>
        )}

        {/* LESSONS TAB */}
        {activeTab === "lessons" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Log New Lesson Form */}
            <form onSubmit={handleAddLesson} className="p-4 border border-border bg-card rounded-2xl flex flex-col gap-3">
              <h3 className="font-bold text-foreground text-sm">Log Today's Lesson</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Topic Taught Today"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Homework Assigned"
                value={newHomework}
                onChange={(e) => setNewHomework(e.target.value)}
                className="px-3 h-10 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
              <textarea
                placeholder="Remarks / Performance observation..."
                value={newRemarks}
                onChange={(e) => setNewRemarks(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground min-h-[72px]"
              />
              <button type="submit" className="h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/95 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Log Lesson Record
              </button>
            </form>

            {/* Lesson Log Records */}
            <div className="flex flex-col gap-3">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3.5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-foreground">{lesson.studentName}</h4>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {lesson.date}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 flex flex-col gap-2.5">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Topic</span>
                      <p className="text-sm text-foreground font-semibold mt-0.5">{lesson.topic}</p>
                    </div>
                    {lesson.homework && (
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Homework</span>
                        <p className="text-sm text-foreground/90 mt-0.5">{lesson.homework}</p>
                      </div>
                    )}
                    {lesson.remarks && (
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Remarks</span>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{lesson.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {lessons.length === 0 && (
                <EmptyState
                  icon={BookOpen}
                  title="No Lessons Logged"
                  description="Log details here for classes taught to students."
                />
              )}
            </div>
          </motion.div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 shadow-sm">
              <SectionHeader
                title="Tuition Attendance Sheet"
                action={<span className="text-xs text-muted-foreground">Today: {new Date().toISOString().split("T")[0]}</span>}
              />

              <div className="flex flex-col border-t border-border divide-y divide-border">
                {students.map((student) => (
                  <div key={student.id} className="flex justify-between items-center py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{student.name}</span>
                      <span className="text-xs text-muted-foreground">{student.className}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAttendance(student.id, "Present")}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                          student.attendance === "Present"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : "bg-background border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Present
                      </button>
                      <button
                        onClick={() => handleToggleAttendance(student.id, "Absent")}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                          student.attendance === "Absent"
                            ? "bg-red-500/15 border-red-500/30 text-red-400"
                            : "bg-background border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
