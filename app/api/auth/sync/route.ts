import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name, avatar } = body;

    if (!id || !email) {
      return NextResponse.json(
        { error: "User ID and Email are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
      create: {
        id,
        email,
        name: name || email.split("@")[0],
        avatar: avatar || "",
        settings: {
          create: {
            theme: "dark",
            accentColor: "#5E0ED7",
            language: "en",
            notifications: true,
          },
        },
      },
      include: { settings: true },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
