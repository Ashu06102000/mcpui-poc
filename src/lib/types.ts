export interface Message {
    role: 'user' | 'assistant';
    content: string;
    toolCalls?: ToolCall[];
}

export interface ToolCall {
    id: string;
    name: string;
    input: any;
    result?: any;
    uiResourceUri?: string;
    uiHtml?: string;
}
