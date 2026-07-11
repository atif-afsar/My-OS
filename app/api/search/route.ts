import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ tasks: [], projects: [], knowledge: [], students: [] });
    }

    // Run parallel searches with case-insensitive matching
    const [tasks, projects, knowledge, students] = await Promise.all([
      prisma.task.findMany({
        where: {
          title: { contains: query, mode: "insensitive" },
        },
        take: 5,
      }),
      prisma.project.findMany({
        where: {
          title: { contains: query, mode: "insensitive" },
        },
        take: 3,
      }),
      prisma.knowledge.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.student.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        take: 3,
      }),
    ]);

    return NextResponse.json({
      tasks,
      projects,
      knowledge,
      students,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
