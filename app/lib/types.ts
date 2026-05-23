export type ToolName =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

export interface ToolSelection {
  id: string;
  name: ToolName;
  enabled: boolean;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface FormData {
  tools: ToolSelection[];
  teamSize: number;
  primaryUseCase: "coding" | "writing" | "data" | "research" | "mixed";
}

export const toolPlans: Record<ToolName, string[]> = {
  cursor: ["Hobby", "Pro", "Business", "Enterprise"],
  "github-copilot": ["Individual", "Business", "Enterprise"],
  claude: ["Free", "Pro", "Max", "Team", "Enterprise", "API direct"],
  chatgpt: ["Plus", "Team", "Enterprise", "API direct"],
  "anthropic-api": ["API direct"],
  "openai-api": ["API direct"],
  gemini: ["Pro", "Ultra", "API"],
  windsurf: ["Free", "Pro", "Team"],
};

export const toolLabels: Record<ToolName, string> = {
  cursor: "Cursor",
  "github-copilot": "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  "anthropic-api": "Anthropic API",
  "openai-api": "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};
