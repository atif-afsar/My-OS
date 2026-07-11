import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.timelineEvent.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, description, referenceId, referenceType } = body;

    if (!type || !title || !description) {
      return NextResponse.json(
        { error: "Type, Title, and Description are required" },
        { status: 400 }
      );
    }

    const event = await prisma.timelineEvent.create({
      data: {
        type,
        title,
        description,
        referenceId: referenceId || null,
        referenceType: referenceType || null,
      },
    });

    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
