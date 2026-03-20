"use client";
import { Button } from "@/components/ui/button";

export default function InteractionToggle({
  mode,
  setMode,
}: {
  mode: "voice" | "chat";
  setMode: (m: "voice" | "chat") => void;
}) {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant={mode === "voice" ? "default" : "outline"}
        onClick={() => setMode("voice")}
      >
        🎤 Voice
      </Button>

      <Button
        variant={mode === "chat" ? "default" : "outline"}
        onClick={() => setMode("chat")}
      >
        💬 Chat
      </Button>
    </div>
  );
}