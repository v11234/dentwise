"use client";

import { useChat } from "@/hooks/useChat";

import { Card } from "@/components/ui/card";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";

export default function ChatWidget({ sessionId }: { sessionId: string }) {
  const { messages, send, loading } = useChat(sessionId);

  return (
    <Card className="fixed bottom-6 right-6 w-96 p-4 shadow-xl">
      <h3 className="font-semibold mb-2">Dental Assistant (Chat)</h3>

      <ChatWindow messages={messages} />

      {loading && (
        <p className="text-xs text-muted-foreground mt-1">
          AI is typing…
        </p>
      )}

      <ChatInput onSend={send} />
    </Card>
  );
}