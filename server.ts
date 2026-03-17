import express from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ReadResourceRequestSchema,
    ListResourcesRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { renderBlocksToHtml } from "./src/lib/renderHtml.js";

const app = express();

// Must parse body BEFORE routing, and must NOT parse for SSE
app.use(cors({ exposedHeaders: ["Mcp-Session-Id"] }));

// Key: each SSE connection gets its own transport, keyed by session
const transports: Map<string, SSEServerTransport> = new Map();

const dynamicResources = new Map<string, string>();

function generateTeraUiHtml(data: any): string {
    return renderBlocksToHtml(data);
}

function createMcpServer() {
    const server = new Server(
        { name: "demo-server", version: "1.0.0" },
        { capabilities: { tools: {}, resources: {} } }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
            {
                name: "show_ui",
                description: "Show a demo interactive UI component",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "show_dynamic_ui",
                description: "Create a custom, professional UI card on the fly using component blocks. Use this for ANY topic including patient profiles, schedules, revenue reports, inventory, etc.",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "The title of the card." },
                        icon: { type: "string", description: "An emoji icon for the header (e.g. 🛠️, 👩‍⚕️, 📝)." },
                        blocks: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string", enum: ["stat-grid", "list", "alert", "text", "actions", "chart"] },
                                    items: {
                                        type: "array",
                                        description: "For 'stat-grid' (label/value/color), 'list' (label/value or strings), or 'actions' (label/icon/primary)."
                                    },
                                    title: { type: "string", description: "Title for list or alert." },
                                    content: { type: "string", description: "Content for text or alert." },
                                    alertType: { type: "string", enum: ["info", "success", "warning", "error"] },
                                    chartType: { type: "string", enum: ["line", "bar", "pie"] },
                                    data: { type: "array", items: { type: "object" } },
                                    config: {
                                        type: "object",
                                        properties: {
                                            xAxisKey: { type: "string" },
                                            series: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        key: { type: "string" },
                                                        label: { type: "string" },
                                                        color: { type: "string" }
                                                    }
                                                }
                                            },
                                            yAxisFormatter: { type: "string" },
                                            valueKey: { type: "string" },
                                            nameKey: { type: "string" }
                                        }
                                    }
                                },
                                required: ["type"]
                            }
                        }
                    },
                    required: ["title", "blocks"]
                }
            }
        ],
    }));

    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: [
            {
                uri: "ui://demo-component",
                name: "Demo UI component",
                mimeType: "text/html",
            },
            ...Array.from(dynamicResources.keys()).map(uri => ({
                uri,
                name: `Dynamic Tera UI ${uri}`,
                mimeType: "text/html",
            }))
        ],
    }));

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        if (request.params.uri === "ui://demo-component") {
            return {
                contents: [
                    {
                        uri: "ui://demo-component",
                        mimeType: "text/html",
                        text: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  * { box-sizing: border-box; margin: 0; padding: 0; }
                  body { font-family: system-ui, sans-serif; padding: 20px; background: #f8fafc; color: #1e293b; }
                  .card { border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                  h2 { margin-bottom: 8px; font-size: 1.2rem; }
                  p { color: #64748b; margin-bottom: 16px; font-size: 0.9rem; }
                  .count { font-size: 3rem; font-weight: 800; color: #3b82f6; margin: 16px 0; }
                  button { background: #3b82f6; color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem; transition: background 0.2s; }
                  button:hover { background: #2563eb; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h2>⚡ Interactive MCP-UI Demo</h2>
                  <p>This component was loaded directly from the local MCP server!</p>
                  <div class="count" id="count">0</div>
                  <button onclick="document.getElementById('count').innerText = parseInt(document.getElementById('count').innerText) + 1">
                    Increment
                  </button>
                </div>
              </body>
              </html>
            `,
                    },
                ],
            };
        }

        if (dynamicResources.has(request.params.uri)) {
            return {
                contents: [
                    {
                        uri: request.params.uri,
                        mimeType: "text/html",
                        text: dynamicResources.get(request.params.uri)!
                    }
                ]
            };
        }

        throw new Error("Resource not found");
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name === "show_ui") {
            return {
                content: [{ type: "text", text: "Here's the interactive demo:" }],
                _meta: { ui: { resourceUri: "ui://demo-component" } },
            };
        }

        if (request.params.name === "show_dynamic_ui") {
            try {
                const data = request.params.arguments as any;
                console.log("🛠️ Tool Call: show_dynamic_ui");

                // Robust check for double-encoded blocks
                if (typeof data.blocks === 'string') {
                    console.log("⚠️ Blocks is a string, attempting to parse...");
                    try {
                        data.blocks = JSON.parse(data.blocks);
                        console.log("✅ Blocks parsed successfully");
                    } catch (e) {
                        console.error("❌ Failed to parse stringified blocks:", e);
                    }
                }

                // Robust check for single object instead of array
                if (data.blocks && !Array.isArray(data.blocks) && typeof data.blocks === 'object') {
                    console.log("⚠️ Blocks is a single object, wrapping in array...");
                    data.blocks = [data.blocks];
                }

                const id = Math.random().toString(36).substring(7);
                const uri = `ui://dynamic-${id}`;
                const html = generateTeraUiHtml(data);
                dynamicResources.set(uri, html);

                return {
                    content: [{ type: "text", text: `Generated dynamic UI card: ${data.title}` }],
                    uiData: data,
                    type: 'dynamic-ui',
                    _meta: { ui: { resourceUri: uri } },
                };
            } catch (err: any) {
                console.error("🔥 ERROR in show_dynamic_ui handler:", err);
                if (err.stack) console.error("📚 Stack trace:", err.stack);
                throw err;
            }
        }

        throw new Error("Tool not found");
    });

    return server;
}

app.get("/sse", async (req, res) => {
    console.log("📥 SSE Connection request received");
    const server = createMcpServer();
    const transport = new SSEServerTransport("/messages", res);
    transports.set(transport.sessionId, transport);

    res.on("close", () => {
        transports.delete(transport.sessionId);
        console.log(`❌ Session ${transport.sessionId} disconnected`);
    });

    try {
        await server.connect(transport);
        console.log(`🔌 New MCP session established: ${transport.sessionId}`);
    } catch (err) {
        console.error("💥 Failed to connect MCP server to transport:", err);
    }
});

// NO body-parsing middleware — the MCP SDK reads the raw IncomingMessage stream directly
app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);

    if (!transport) {
        console.warn(`⚠️ Session not found for POST /messages: ${sessionId}`);
        res.status(404).send("Session not found");
        return;
    }

    try {
        await transport.handlePostMessage(req, res);
    } catch (err) {
        console.error("💥 Error handling POST message:", err);
        res.status(500).send("Internal error");
    }
});

const PORT = 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Local MCP SSE server → http://localhost:${PORT}/sse`);
});

// Global error handlers to prevent process exit and help debugging
process.on("uncaughtException", (err) => {
    console.error("🔥 CRITICAL: Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("🔥 CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
});
