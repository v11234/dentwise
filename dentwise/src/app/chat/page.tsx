"use client";

import { useState, useRef, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useTranslations } from "@/components/LocaleProvider";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const { t } = useTranslations();
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      role: "assistant",
      content: t("chat.greeting"),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const historyForApi = [...messages, { role: "user" as const, content: userMessage }];

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, messages: historyForApi }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(errorBody || `Request failed with status ${res.status}`);
      }

      if (!res.body) throw new Error("No response body from API");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMessage += decoder.decode(value);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: assistantMessage },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: t("chat.error"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background px-4 pt-20">
        <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-4xl flex-col rounded-xl border bg-background shadow-sm">
          <SignedOut>
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <h2 className="mb-3 text-2xl font-semibold">{t("chat.signInTitle")}</h2>
              <p className="mb-6 text-muted-foreground">
                {t("chat.signInSubtitle")}
              </p>
              <SignInButton mode="modal">
                <Button>{t("chat.signInButton")}</Button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="border-b px-6 py-4">
              <h1 className="text-lg font-semibold">{t("chat.headerTitle")}</h1>
              <p className="text-sm text-muted-foreground">
                {t("chat.headerSubtitle")}
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
                    {t("chat.typing")}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={t("chat.inputPlaceholder")}
                  className="flex-1 rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={sendMessage} disabled={loading}>
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
    </>
  );
}


