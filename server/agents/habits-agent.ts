import { chatWithAgent } from "./base-agent";
import { buildHabitsContext } from "./context-builders";
import type { HabitsContext } from "./prompts/habits-prompt";

export async function chatWithHabitsAgent(
  messages: { role: string; content: string }[],
  userId: string
): Promise<string> {
  const context = await buildHabitsContext(userId);
  return chatWithAgent("habits", messages, context);
}

