import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const notes = await prisma.learningNote.findMany({
      include: { topic: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topicId, title, content, tags, attachments } = body;

    if (!topicId || !title || !content) {
      return NextResponse.json(
        { error: "Topic ID, Title, and Content are required" },
        { status: 400 }
      );
    }

    const note = await prisma.learningNote.create({
      data: {
        topicId,
        title,
        content,
        tags: tags || [],
        attachments: attachments || [],
      },
      include: { topic: true },
    });

    return NextResponse.json(note);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
