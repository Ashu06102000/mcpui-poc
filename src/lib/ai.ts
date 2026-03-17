
import Anthropic from '@anthropic-ai/sdk';
import type { Message, ToolCall } from './types';
import { TERA_DEMO_SYSTEM_PROMPT } from './prompt';


export class AiManager {
    private anthropic: Anthropic | null = null;

    init(apiKey: string) {
        this.anthropic = new Anthropic({
            apiKey,
            dangerouslyAllowBrowser: true
        });
    }

    async sendMessage(
        messages: Message[],
        tools: any[]
    ): Promise<Message> {
        if (!this.anthropic) throw new Error("AI Manager not initialized");

        const anthropicMessages: any[] = messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        const response = await this.anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1024,
            system: TERA_DEMO_SYSTEM_PROMPT,
            messages: anthropicMessages,
            tools: tools.map(t => ({
                name: t.name,
                description: t.description,
                input_schema: t.inputSchema
            }))
        });

        let content = "";
        const toolCalls: ToolCall[] = [];

        for (const block of response.content) {
            if (block.type === 'text') {
                content += block.text;
            } else if (block.type === 'tool_use') {
                toolCalls.push({
                    id: block.id,
                    name: block.name,
                    input: block.input
                });
            }
        }

        return {
            role: 'assistant',
            content,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined
        };
    }
}

export const aiManager = new AiManager();
