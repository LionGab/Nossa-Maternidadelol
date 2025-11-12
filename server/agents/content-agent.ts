import { chatWithAgent } from "./base-agent";
import { buildContentContext } from "./context-builders";
import type { ContentContext } from "./prompts/content-prompt";

export async function chatWithContentAgent(
  messages: { role: string; content: string }[],
  userId: string
): Promise<string> {
  const context = await buildContentContext(userId);
  return chatWithAgent("content", messages, context);
}

