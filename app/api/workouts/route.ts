import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const workouts = await prisma.workout.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(workouts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { exercise, sets, reps, weight, duration, notes, date } = body;

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise name is required" },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.create({
      data: {
        exercise,
        sets: parseInt(sets) || 0,
        reps: parseInt(reps) || 0,
        weight: parseFloat(weight) || 0.0,
        duration: duration || null,
        notes: notes || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(workout);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
