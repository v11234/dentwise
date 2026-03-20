import { dentalPrompt } from "./dentalPrompt";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export type AIErrorKind =
  | "quota_exceeded"
  | "auth_error"
  | "provider_error"
  | "config_error";

export class AIServiceError extends Error {
  kind: AIErrorKind;
  status?: number;
  publicMessage: string;
  details?: string;

  constructor(params: {
    message: string;
    kind: AIErrorKind;
    status?: number;
    publicMessage: string;
    details?: string;
  }) {
    super(params.message);
    this.name = "AIServiceError";
    this.kind = params.kind;
    this.status = params.status;
    this.publicMessage = params.publicMessage;
    this.details = params.details;
  }
}

function parseProviderErrorCode(errorText: string): string | undefined {
  try {
    const parsed = JSON.parse(errorText) as { error?: { code?: string | number; status?: string; type?: string } };
    const code = parsed.error?.code ?? parsed.error?.status ?? parsed.error?.type;
    return code ? String(code) : undefined;
  } catch {
    return undefined;
  }
}

export async function runDentalAI(messages: Message[]) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new AIServiceError({
      message: "Missing required environment variable: GEMINI_API_KEY",
      kind: "config_error",
      publicMessage: "AI service is not configured right now. Please try again later.",
      details: "GEMINI_API_KEY was not found in process.env",
    });
  }

  const geminiContents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const modelCandidates = Array.from(
    new Set(
      [
        configuredModel,
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash-latest",
      ].filter((m): m is string => Boolean(m))
    )
  );

  let lastStatus: number | undefined;
  let lastErrorText = "";

  for (const model of modelCandidates) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: dentalPrompt }],
          },
          contents: geminiContents,
        }),
      }
    );

    if (response.ok) {
      const data = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text?.trim() || "I could not generate a response right now.";
    }

    const errorText = await response.text();
    const parsedCode = parseProviderErrorCode(errorText);
    lastStatus = response.status;
    lastErrorText = errorText;

    if (
      response.status === 429 ||
      parsedCode === "insufficient_quota" ||
      parsedCode === "RESOURCE_EXHAUSTED"
    ) {
      throw new AIServiceError({
        message: "Gemini quota exceeded",
        kind: "quota_exceeded",
        status: response.status,
        publicMessage:
          "DentWise AI is temporarily unavailable due to usage limits. Please try again later.",
        details: errorText || "No error body returned",
      });
    }

    if (response.status === 401 || response.status === 403) {
      throw new AIServiceError({
        message: "Gemini authentication failed",
        kind: "auth_error",
        status: response.status,
        publicMessage: "AI service authentication failed. Please contact support.",
        details: errorText || "No error body returned",
      });
    }

    const isModelNotFound =
      response.status === 404 || parsedCode === "NOT_FOUND" || parsedCode === "404";
    if (isModelNotFound) {
      continue;
    }

    throw new AIServiceError({
      message: `Gemini request failed with status ${response.status}`,
      kind: "provider_error",
      status: response.status,
      publicMessage: "AI service is currently unavailable. Please try again soon.",
      details: errorText || "No error body returned",
    });
  }

  throw new AIServiceError({
    message: "No compatible Gemini model was found for generateContent",
    kind: "config_error",
    status: lastStatus,
    publicMessage: "AI service is currently unavailable. Please try again soon.",
    details: `Tried models: ${modelCandidates.join(", ")}. Last error: ${lastErrorText || "unknown"}`,
  });
}
