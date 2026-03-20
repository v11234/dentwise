"use server";



import { runDentalAI } from "@/lib/ai";
import { getUserId } from "../auth";
import { prisma } from "../prisma";

// create a new session
export async function createChatSession() {
  const userId = await getUserId();
  const session = await prisma.chatSession.create({
    data: { userId },
  });
  return session.id;
}

// send a chat message
export async function sendChatMessage(sessionId: string, message: string) {
  // create user message
  await prisma.chatMessage.create({
    data: {
      sessionId,
      role: "user",
      content: message,
    },
  });

  // fetch all messages for AI history
  const history = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  // prepare messages for AI
  const messagesForAI: Array<{ role: "user" | "assistant"; content: string }> = history.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const reply = await runDentalAI(messagesForAI);

  // save AI response
  await prisma.chatMessage.create({
    data: {
      sessionId,
      role: "assistant",
      content: reply,
    },
  });

  return reply;
}