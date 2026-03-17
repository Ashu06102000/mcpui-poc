import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { ToolCall } from "./types";

export class McpManager {
    private client: Client | null = null;

    async connect(url: string) {
        const transport = new SSEClientTransport(new URL(url));
        this.client = new Client(
            { name: "mcp-chat-app", version: "1.0.0" },
            { capabilities: {} }
        );
        await this.client.connect(transport);
        console.log("Connected to MCP server:", url);
        return this.client;
    }

    getClient() {
        return this.client;
    }

    async listTools() {
        if (!this.client) throw new Error("MCP Client not connected");
        return await this.client.listTools();
    }

    async callTool(name: string, args: any): Promise<ToolCall> {
        if (!this.client) throw new Error("MCP Client not connected");

        const result = await this.client.callTool({
            name,
            arguments: args,
        }) as any;

        // Extract UI resourceUri from _meta — it may be on result directly or nested
        const uiResourceUri: string | undefined =
            result?._meta?.ui?.resourceUri;

        // If there's a UI resource, fetch its HTML content
        let uiHtml: string | undefined;
        if (uiResourceUri) {
            try {
                const resource = await this.client.readResource({ uri: uiResourceUri }) as any;
                uiHtml = resource?.contents?.[0]?.text;
            } catch (e) {
                console.warn('Failed to read UI resource:', e);
            }
        }

        return {
            id: Math.random().toString(36).substring(7),
            name,
            input: args,
            result,
            uiResourceUri,
            uiHtml,
        };
    }
}

export const mcpManager = new McpManager();
