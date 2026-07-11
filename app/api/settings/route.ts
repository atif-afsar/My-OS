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

    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { theme, accentColor, language, notifications } = body;

    const headerUserId = request.headers.get("x-user-id");
    let userId = headerUserId;

    if (!userId) {
      const defaultUser = await getOrCreateDefaultUser();
      userId = defaultUser.id;
    }

    const updated = await prisma.settings.update({
      where: { userId },
      data: {
        ...(theme !== undefined && { theme }),
        ...(accentColor !== undefined && { accentColor }),
        ...(language !== undefined && { language }),
        ...(notifications !== undefined && { notifications }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
