"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type ChatInputProps = {
  onSend: (text: string) => void;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  return (
    <div className="flex gap-2 mt-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message…"
      />
      <Button
        onClick={() => {
          onSend(text);
          setText("");
        }}
      >
        Send
      </Button>
    </div>
  );
}