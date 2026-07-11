import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, className, school, parentName, phone, notes } = body;

    if (!name || !className) {
      return NextResponse.json(
        { error: "Name and Class Name are required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        name,
        className,
        school: school || null,
        parentName: parentName || null,
        phone: phone || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(student);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
