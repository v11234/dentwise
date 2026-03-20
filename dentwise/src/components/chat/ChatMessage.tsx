type ChatMessageType = {
  role: "user" | "assistant" | string;
  content: string;
};

type ChatMessageProps = {
  msg: ChatMessageType;
};

export default function ChatMessage({ msg }: ChatMessageProps) {
  return (
    <div className={msg.role === "user" ? "text-right" : "text-left"}>
      <span className="inline-block bg-muted px-3 py-2 rounded">
        {msg.content}
      </span>
    </div>
  );
}