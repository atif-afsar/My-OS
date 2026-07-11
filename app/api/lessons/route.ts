import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const lessons = await prisma.lesson.findMany({
      include: { student: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(lessons);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, topic, homework, remarks, date } = body;

    if (!studentId || !topic) {
      return NextResponse.json(
        { error: "Student ID and Topic are required" },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        studentId,
        topic,
        homework: homework || null,
        remarks: remarks || null,
        date: date ? new Date(date) : new Date(),
      },
      include: { student: true },
    });

    return NextResponse.json(lesson);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
