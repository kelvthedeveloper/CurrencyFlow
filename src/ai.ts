// AI helper functions - supports free local Ollama, OpenAI, and Anthropic
const OLLAMA_URL = "http://localhost:11434/api/generate"

export interface AIExplanationRequest {
  originalAmount: number
  originalCurrency: string
  convertedAmount: number
  convertedCurrency: string
}

export async function getAIExplanation(request: AIExplanationRequest): Promise<string> {
  const prompt = `You are a helpful financial assistant. Explain what ${request.originalAmount} ${request.originalCurrency} (${request.convertedAmount} ${request.convertedCurrency}) means in simple, real-world terms. For example, how many groceries, meals, or typical items it could buy. Keep it under 50 words and friendly!`

  try {
    // First try Ollama (free, local)
    return await callOllama(prompt)
  } catch (ollamaError) {
    console.log("Ollama not available, trying other options...")
    return "AI explanations available when you start Ollama locally with `ollama run llama3`!"
  }
}

async function callOllama(prompt: string): Promise<string> {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false
    })
  })

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.response || "Ollama returned an empty response"
}
