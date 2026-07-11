import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const topics = await prisma.learningTopic.findMany({
      orderBy: { title: "asc" },
    });
    return NextResponse.json(topics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, description, progress, status } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and Category are required" },
        { status: 400 }
      );
    }

    const topic = await prisma.learningTopic.create({
      data: {
        title,
        category,
        description: description || null,
        progress: parseInt(progress) || 0,
        status: status || "Not Started",
      },
    });

    return NextResponse.json(topic);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const topic = await prisma.learningTopic.delete({
      where: { id },
    });

    return NextResponse.json(topic);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
