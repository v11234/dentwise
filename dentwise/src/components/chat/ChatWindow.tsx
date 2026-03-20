import ChatMessage from "./ChatMessage";

type ChatMessageType = {
  role: "user" | "assistant" | string;
  content: string;
};

type ChatWindowProps = {
  messages: ChatMessageType[];
};

export default function ChatWindow({ messages }: ChatWindowProps) {
  return (
    <div className="h-64 overflow-y-auto space-y-2 border rounded p-2">
      {messages.map((m, i) => (
        <ChatMessage key={i} msg={m} />
      ))}
    </div>
  );
}