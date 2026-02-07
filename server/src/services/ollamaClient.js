const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";

export const generateAnswer = async ({ tenantName, question, context, history = [] }) => {
  const systemPrompt = `You are a helpful customer assistant for ${tenantName}. Answer using only relevant context. If context is missing, say you do not have enough business data.`;

  const prompt = [
    `SYSTEM:\n${systemPrompt}`,
    history.length ? `CHAT HISTORY:\n${history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}` : null,
    `CONTEXT:\n${context || "No matching tenant documents."}`,
    `QUESTION:\n${question}`,
    "ANSWER:"
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed (${response.status})`);
    }

    const data = await response.json();
    return data.response?.trim() || "I could not generate a response.";
  } catch (error) {
    return `Ollama unavailable (${error.message}). Fallback response: Based on tenant context, here is what I found: ${context || "No relevant context found."}`;
  }
};
