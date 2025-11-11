export interface PerplexityResponse {
  answer: string;
  sources: { title: string; url: string }[];
}

export async function searchWithPerplexity(question: string): Promise<PerplexityResponse> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "Você é uma assistente especializada em maternidade e saúde materno-infantil. Forneça respostas precisas, bem fundamentadas e empáticas. Use bullet points quando apropriado. Sempre cite fontes confiáveis.",
        },
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  const answer = data.choices[0]?.message?.content || "Não consegui encontrar uma resposta.";
  const citations = data.citations || [];
  
  const sources = citations.map((url: string) => ({
    title: new URL(url).hostname,
    url,
  })).slice(0, 4); // Limit to 4 sources

  return { answer, sources };
}
