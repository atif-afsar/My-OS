import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultUser } from "@/lib/user";

export async function GET(request: Request) {
  try {
    const headerUserId = request.headers.get("x-user-id");
    let userId = headerUserId;

    if (!userId) {
      const defaultUser = await getOrCreateDefaultUser();
      userId = defaultUser.id;
    }

    const { searchParams } = new URL(request.url);
    const timezone = searchParams.get("timezone") || "UTC";

    // Limit query window to past 120 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 120);

    const [tasks, workouts, lessons, learningNotes, knowledge] = await Promise.all([
      // 1. Work: Completed tasks
      prisma.task.findMany({
        where: {
          userId,
          status: "Completed",
          updatedAt: { gte: cutoffDate },
        },
        select: { updatedAt: true },
      }),
      // 2. Gym: Workouts logged
      prisma.workout.findMany({
        where: {
          date: { gte: cutoffDate },
        },
        select: { date: true },
      }),
      // 3. Teaching: Lessons taught
      prisma.lesson.findMany({
        where: {
          date: { gte: cutoffDate },
        },
        select: { date: true },
      }),
      // 4. Learning: Notes added
      prisma.learningNote.findMany({
        where: {
          createdAt: { gte: cutoffDate },
        },
        select: { createdAt: true },
      }),
      // 5. Mind: Reflections, brain notes, review logs
      prisma.knowledge.findMany({
        where: {
          createdAt: { gte: cutoffDate },
        },
        select: { createdAt: true },
      }),
    ]);

    // Format utility for YYYY-MM-DD in the user's localized timezone
    const getLocalDateString = (dateVal: Date, tz: string) => {
      try {
        const formatter = new Intl.DateTimeFormat("en-CA", {
          timeZone: tz,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        return formatter.format(new Date(dateVal));
      } catch (e) {
        return new Date(dateVal).toISOString().split("T")[0];
      }
    };

    // Helper to count occurrences per date
    const aggregateData = (items: any[], dateField: string, tz: string) => {
      const counts: Record<string, number> = {};
      items.forEach((item) => {
        if (item[dateField]) {
          const dateStr = getLocalDateString(item[dateField], tz);
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        }
      });
      return counts;
    };

    return NextResponse.json({
      Work: aggregateData(tasks, "updatedAt", timezone),
      Gym: aggregateData(workouts, "date", timezone),
      Teaching: aggregateData(lessons, "date", timezone),
      Learning: aggregateData(learningNotes, "createdAt", timezone),
      Mind: aggregateData(knowledge, "createdAt", timezone),
    });
  } catch (error: any) {
    console.error("Heatmap API route error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
