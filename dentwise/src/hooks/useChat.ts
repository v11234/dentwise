"use client";

import { createChatSession, sendChatMessage } from "@/lib/actions/chat";
import { useEffect, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function useChat(initialSessionId?: string) {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSessionId) return;

    async function init() {
      const id = await createChatSession();
      setSessionId(id);
    }
    init();
  }, [initialSessionId]);

  async function send(text: string) {
    if (!sessionId) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);

    const reply = await sendChatMessage(sessionId, text);
    setMessages((m) => [...m, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  return { messages, send, loading };
}