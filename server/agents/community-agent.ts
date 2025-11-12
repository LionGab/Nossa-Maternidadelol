import { chatWithAgent } from "./base-agent";
import { buildCommunityContext } from "./context-builders";
import type { CommunityContext } from "./prompts/community-prompt";

export async function chatWithCommunityAgent(
  messages: { role: string; content: string }[],
  userId: string
): Promise<string> {
  const context = await buildCommunityContext(userId);
  return chatWithAgent("community", messages, context);
}

