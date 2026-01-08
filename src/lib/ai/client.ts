import Anthropic from "@anthropic-ai/sdk";

const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

if (!anthropicApiKey) {
    console.warn("Missing ANTHROPIC_API_KEY - AI functionality disabled");
}

export const anthropic = anthropicApiKey
    ? new Anthropic({ apiKey: anthropicApiKey })
    : null;

export type AgentMessage = {
    role: "user" | "assistant";
    content: string;
};

export type AgentTool = {
    name: string;
    description: string;
    input_schema: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
    };
};

export async function runAgent({
    systemPrompt,
    messages,
    tools,
    maxTokens = 4096,
}: {
    systemPrompt: string;
    messages: AgentMessage[];
    tools?: AgentTool[];
    maxTokens?: number;
}) {
    if (!anthropic) {
        return { error: "AI service not configured" };
    }

    try {
        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: maxTokens,
            system: systemPrompt,
            messages,
            tools: tools as Anthropic.Tool[],
        });

        return {
            content: response.content,
            stopReason: response.stop_reason,
            usage: response.usage,
        };
    } catch (err) {
        console.error("[AI] Exception:", err);
        return { error: String(err) };
    }
}
