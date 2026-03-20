import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export function getVapiClient() {
  const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
  if (!apiKey) return null;

  if (!vapiInstance) {
    vapiInstance = new Vapi(apiKey);
  }

  return vapiInstance;
}
