import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AIServiceError, runDentalAI } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function normalizeChatMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .map((m) => {
      if (typeof m !== "object" || m === null) return null;

      const content = (m as { content?: unknown }).content;
      if (typeof content !== "string" || !content.trim()) return null;

      const roleCandidate = (m as { role?: unknown }).role;
      const role: ChatMessage["role"] = roleCandidate === "assistant" ? "assistant" : "user";

      return { role, content: content.trim() };
    })
    .filter((m): m is ChatMessage => m !== null);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      message?: string;
      messages?: unknown;
    };

    const incomingMessage = body.message?.trim();
    if (!incomingMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const normalizedMessages = normalizeChatMessages(body.messages);
    const history: ChatMessage[] = normalizedMessages.length
      ? normalizedMessages
      : [{ role: "user", content: incomingMessage }];

    const reply = await runDentalAI(history);

    try {
      await prisma.chatSession.create({
        data: {
          userId,
          messages: {
            create: [
              { role: "user", content: incomingMessage },
              { role: "assistant", content: reply },
            ],
          },
        },
      });
    } catch (persistenceError) {
      console.warn("[chat-api] persistence failed", persistenceError);
    }

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(reply));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    if (error instanceof AIServiceError && error.kind === "quota_exceeded") {
      console.warn("[chat-api] AI quota exceeded", {
        kind: error.kind,
        status: error.status,
        details: error.details,
      });

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(error.publicMessage));
          controller.close();
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      });
    }

    if (error instanceof AIServiceError) {
      console.error("[chat-api] AI service error", {
        kind: error.kind,
        status: error.status,
        details: error.details,
        message: error.message,
      });
    } else {
      console.error("[chat-api] unexpected error", error);
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
