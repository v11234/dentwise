"use client";
import { getVapiClient } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { AlertCircleIcon } from "lucide-react";

type TranscriptMessage = {
  type?: string;
  transcriptType?: string;
  transcript?: string;
  role?: "assistant" | "user";
};

const ASSISTANT_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isResponseLike(error: unknown): error is Response {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as Response).status === "number"
  );
}

async function extractErrorMessage(error: unknown) {
  if (isResponseLike(error)) {
    let details = "";
    try {
      details = await error.text();
    } catch {
      details = "";
    }

    if (details) {
      return `Voice provider error (${error.status}): ${details}`;
    }

    return `Voice provider error (${error.status}).`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Voice assistant failed to connect. Please try again.";
}

function VapiWidget() {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Array<{ content: string; role: string }>>([]);
  const [callEnded, setCallEnded] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const { user, isLoaded } = useUser();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const vapi = getVapiClient();
  const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY?.trim() || "";
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID?.trim() || "";
  const hasValidAssistantId = ASSISTANT_ID_REGEX.test(assistantId);
  const apiKeyMatchesAssistant = Boolean(apiKey && assistantId && apiKey === assistantId);

  const configError = !assistantId
    ? "Voice is not configured. Set NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env."
    : !hasValidAssistantId
    ? "NEXT_PUBLIC_VAPI_ASSISTANT_ID is invalid. It should be a UUID value."
    : !apiKey
    ? "Voice is not configured. Set NEXT_PUBLIC_VAPI_API_KEY in .env."
    : apiKeyMatchesAssistant
    ? "NEXT_PUBLIC_VAPI_API_KEY is set to the assistant ID. Use your Vapi API key instead."
    : !vapi
    ? "Voice service is unavailable right now. Please refresh."
    : null;

  const voiceConfigured = !configError;

  // auto-scroll for messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // setup event listeners for VAPI
  useEffect(() => {
    if (!vapi) return;

    const handleCallStart = () => {
      console.log("Call started");
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
      setVoiceError(null);
    };

    const handleCallEnd = () => {
      console.log("Call ended");
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };

    const handleSpeechStart = () => {
      console.log("AI started Speaking");
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      console.log("AI stopped Speaking");
      setIsSpeaking(false);
    };

    const handleMessage = (message: TranscriptMessage) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { content: message.transcript || "", role: message.role || "assistant" };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleError = async (error: unknown) => {
      console.log("Vapi Error", error);
      setConnecting(false);
      setCallActive(false);
      const message = await extractErrorMessage(error);
      setVoiceError(message);
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    // cleanup event listeners on unmount
    return () => {
      vapi
        .off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)
        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError);
    };
  }, [vapi]);

  const toggleCall = async () => {
    if (!voiceConfigured) {
      setVoiceError(configError || "Voice is not configured. Check your .env settings.");
      return;
    }

    if (callActive) {
      vapi?.stop();
    } else {
      if (!vapi) {
        setVoiceError("Voice service is unavailable right now. Please refresh.");
        return;
      }
      try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);
        setVoiceError(null);

        await vapi.start(assistantId);
      } catch (error) {
        console.log("Failed to start call", error);
        const message = await extractErrorMessage(error);
        setVoiceError(
          message || "Unable to start voice call. Check microphone permission and try again."
        );
        setConnecting(false);
      }
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col overflow-hidden pb-10 md:pb-20">
      {/* TITLE */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-mono">
          <span>Talk to Your </span>
          <span className="text-primary uppercase">AI Dental Assistant</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Have a voice conversation with our AI assistant for dental advice and guidance
        </p>
        {!voiceConfigured && configError && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-700">
            <AlertCircleIcon className="h-3.5 w-3.5" />
            {configError}
          </div>
        )}
        {voiceError && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700">
            <AlertCircleIcon className="h-3.5 w-3.5" />
            {voiceError}
          </div>
        )}
      </div>

      {/* VIDEO CALL AREA */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
        {/* AI ASSISTANT CARD */}

        <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
          <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
            {/* AI VOICE ANIMATION */}
            <div
              className={`absolute inset-0 ${
                isSpeaking ? "opacity-30" : "opacity-0"
              } transition-opacity duration-300`}
            >
              {/* voice wave animation when speaking */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`mx-1 h-16 w-1 bg-primary rounded-full ${
                      isSpeaking ? "animate-sound-wave" : ""
                    }`}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      height: isSpeaking ? `${Math.random() * 50 + 20}%` : "5%",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* AI LOGO */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4">
              <div
                className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${
                  isSpeaking ? "animate-pulse" : ""
                }`}
              />

              <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/5"></div>
                <Image
                  src="/logo.png"
                  alt="AI Dental Assistant"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground">DentWise AI</h2>
            <p className="text-sm text-muted-foreground mt-1">Dental Assistant</p>

            {/* SPEAKING INDICATOR */}
            <div
              className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${
                isSpeaking ? "border-primary" : ""
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isSpeaking ? "bg-primary animate-pulse" : "bg-muted"
                }`}
              />

              <span className="text-xs text-muted-foreground">
                {isSpeaking
                  ? "Speaking..."
                  : callActive
                  ? "Listening..."
                  : callEnded
                  ? "Call ended"
                  : "Waiting..."}
              </span>
            </div>
          </div>
        </Card>

        {/* USER CARD */}
        <Card className={`bg-card/90 backdrop-blur-sm border overflow-hidden relative`}>
          <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
            {/* User Image */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4 rounded-full overflow-hidden">
              <Image
                src={user?.imageUrl || "/logo.png"}
                alt="User"
                width={128}
                height={128}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <h2 className="text-xl font-bold text-foreground">You</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user ? (user.firstName + " " + (user.lastName || "")).trim() : "Guest"}
            </p>

            {/* User Ready Text */}
            <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border`}>
              <div className={`w-2 h-2 rounded-full bg-muted`} />
              <span className="text-xs text-muted-foreground">Ready</span>
            </div>
          </div>
        </Card>
      </div>

      {/* MESSAGE CONTAINER */}
      {messages.length > 0 && (
        <div
          ref={messageContainerRef}
          className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-48 md:h-64 overflow-y-auto transition-all duration-300 scroll-smooth"
        >
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className="message-item animate-in fade-in duration-300">
                <div className="font-semibold text-xs text-muted-foreground mb-1">
                  {msg.role === "assistant" ? "DentWise AI" : "You"}:
                </div>
                <p className="text-foreground">{msg.content}</p>
              </div>
            ))}

            {callEnded && (
              <div className="message-item animate-in fade-in duration-300">
                <div className="font-semibold text-xs text-primary mb-1">System:</div>
                <p className="text-foreground">Call ended. Thank you for using DentWise AI!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CALL CONTROLS */}
      <div className="w-full flex justify-center gap-4">
        <Button
          className={`w-full max-w-xs text-sm md:text-lg lg:text-xl rounded-3xl ${
            callActive
              ? "bg-destructive hover:bg-destructive/90"
              : callEnded
              ? "bg-red-500 hover:bg-red-700"
              : "bg-primary hover:bg-primary/90"
          } text-white relative`}
          onClick={toggleCall}
          disabled={connecting || callEnded || !voiceConfigured}
        >
          {connecting && (
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
          )}

          <span>
            {callActive
              ? "End Call"
              : connecting
              ? "Connecting..."
              : callEnded
              ? "Call Ended"
              : "Start Call"}
          </span>
        </Button>
      </div>
    </div>
  );
}

export default VapiWidget;
