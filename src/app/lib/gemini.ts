import { apiFetch } from "./supabase";
import { getLocalAIResponse } from "./mock-data";

// Backend handles all Gemini API calls - no frontend keys needed

export async function streamChat(
  messages: Array<{ role: "user" | "model"; text: string }>,
  onChunk: (text: string) => void
): Promise<string> {
  const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.text ?? "";

  let text: string;
  try {
    const res = await apiFetch<{ text: string }>("/pearl/message", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });
    text = res.text;
  } catch {
    // Fallback: use local AI response
    text = getLocalAIResponse(messages);
  }

  // Simulate streaming for better UX
  const words = text.split(" ");
  let accumulated = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i] + (i < words.length - 1 ? " " : "");
    accumulated += word;
    onChunk(word);

    // Small delay to simulate streaming
    if (i < words.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 30));
    }
  }

  return text;
}

export async function transcribeAndParse(audioBase64: string, mimeType: string) {
  try {
    const { parsed } = await apiFetch<{ parsed: any }>("/parse-voice", {
      method: "POST",
      body: JSON.stringify({ audioBase64, mimeType }),
    });
    return parsed;
  } catch (error: any) {
    console.error("Voice transcription error:", error);
    throw new Error(error?.message || "Не удалось распознать речь");
  }
}

// Note: TTS (Text-to-Speech) not yet implemented on backend
// Will be added in future update with Gemini 2.0 Flash voice output
