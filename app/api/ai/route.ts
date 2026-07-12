// Trigger build deploy
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key is not configured in .env." },
      { status: 500 }
    );
  }

  try {
    const { message, userId, localTime, timeZone } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const [tasks, projects, knowledge, workouts, timeline] = await Promise.all([
      prisma.task.findMany({
        where: userId ? { userId } : undefined,
        take: 30,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, priority: true, createdAt: true },
      }),
      prisma.project.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true },
      }),
      prisma.knowledge.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, category: true, favorite: true },
      }),
      prisma.workout.findMany({
        take: 8,
        orderBy: { date: "desc" },
        select: { id: true, exercise: true, sets: true, reps: true, weight: true, date: true },
      }),
      prisma.timelineEvent.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: { type: true, title: true, createdAt: true },
      }),
    ]);

    // Helper to format dates cleanly using the user's local timezone if provided
    const formatTimezoneDate = (dateVal: Date | string, userTimezone?: string) => {
      try {
        const d = new Date(dateVal);
        if (userTimezone) {
          return d.toLocaleString("en-US", { timeZone: userTimezone });
        }
        return d.toLocaleString();
      } catch (e) {
        return new Date(dateVal).toLocaleString();
      }
    };

    const userLocalTimeStr = localTime ? formatTimezoneDate(localTime, timeZone) : new Date().toLocaleString();

    // Format context text
    const context = `
Current time (User's timezone: ${timeZone || "UTC"}): ${userLocalTimeStr}

USER TASKS:
${tasks.map((t: any) => `- [${t.status}] ${t.title} (Priority: ${t.priority}, ID: ${t.id})`).join("\n")}

ACTIVE PROJECTS:
${projects.map((p: any) => `- ${p.title} (Status: ${p.status}, ID: ${p.id})`).join("\n")}

SECOND BRAIN KNOWLEDGE NOTES:
${knowledge.map((k: any) => `- ${k.title} [Category: ${k.category}]${k.favorite ? " (Favorite)" : ""} (ID: ${k.id})`).join("\n")}

GYM WORKOUTS LOGS (Last 10):
${workouts.map((w: any) => `- ${w.exercise}: ${w.sets} sets x ${w.reps} reps @ ${w.weight}kg (Date: ${formatTimezoneDate(w.date, timeZone)})`).join("\n")}

RECENT TIMELINE ACTIVITIES:
${timeline.map((e: any) => `- [${e.type}] ${e.title} (${formatTimezoneDate(e.createdAt, timeZone)})`).join("\n")}
`;

    // 2. Prepare Gemini Prompt
    const systemPrompt = `
You are the intelligence core of MyOS (Personal Operating System) for user Atif Afsar.
You have direct read-access to the user's dashboard database.

Here is the current state of Atif's MyOS database:
${context}

Your Goal:
Answer the user's message conversationally and constructively. Format your response utilizing beautiful, clean markdown styling. Always prioritize answers using the user's current data. If they ask about information not in their database, search your knowledge base to respond but state that it's general information.

You can also execute commands automatically on MyOS. If the user explicitly asks you to do something (e.g. create a task, note, or log something), return a "command" object in your JSON output.

Response JSON Schema:
{
  "message": "Your text response to the user. Use clear headings, bullet points, or tables where appropriate.",
  "command": null | {
    "action": "CREATE_TASK" | "CREATE_NOTE" | "LOG_WORKOUT",
    "data": {
      // For CREATE_TASK:
      "title": "Task title string",
      "priority": "Low" | "Medium" | "High" | "Urgent",
      
      // For CREATE_NOTE:
      "title": "Note title string",
      "content": "Full markdown note content",
      "category": "Reflections" | "Philosophy" | "Ideas" | "Quotes" | "Islamic Notes" | "Inbox",
      
      // For LOG_WORKOUT:
      "exercise": "Exercise name",
      "sets": number,
      "reps": number,
      "weight": number
    }
  }
}

Examples:
- User: "Remind me to prep for brandsway tomorrow morning"
  JSON command: { "action": "CREATE_TASK", "data": { "title": "Prep for BrandsWay tomorrow morning", "priority": "High" } }
- User: "Write down an idea to try cold exposure for focus"
  JSON command: { "action": "CREATE_NOTE", "data": { "title": "Cold exposure for focus", "content": "Explore cold showers/exposure in the morning to increase dopamine and morning focus.", "category": "Ideas" } }

Always output ONLY valid JSON matching this schema. Do not write markdown code fences (\`\`\`json) in your actual output text, respond only with raw JSON.
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt + `\n\nUser Message: "${message}"` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              message: {
                type: "STRING",
                description: "Conversational markdown text response to the user."
              },
              command: {
                type: "OBJECT",
                properties: {
                  action: {
                    type: "STRING",
                    enum: ["CREATE_TASK", "CREATE_NOTE", "LOG_WORKOUT"]
                  },
                  data: {
                    type: "OBJECT",
                    description: "Data properties conforming to the chosen action type."
                  }
                },
                required: ["action", "data"]
              }
            },
            required: ["message"]
          }
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json({ error: `Gemini API error: ${errText}` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: "Empty response from Gemini." }, { status: 502 });
    }

    // Extract JSON block in case Gemini wraps it in markdown backticks or text
    const extractJson = (text: string) => {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        return text.substring(start, end + 1);
      }
      return text;
    };

    const cleanedText = extractJson(rawText);
    const parsed = JSON.parse(cleanedText);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("AI assistant route error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
