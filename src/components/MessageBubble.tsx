import React, { useEffect } from 'react';
import type { Message } from '../lib/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { DynamicRenderer, Card, CardContent } from './ui';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'resize' && event.source) {
                // Find all iframes and check which one matches the event source
                const iframes = document.querySelectorAll('iframe');
                for (const iframe of Array.from(iframes)) {
                    if (iframe.contentWindow === event.source) {
                        iframe.style.height = `${event.data.height}px`;
                        break;
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className={cn("message-bubble", isUser ? "message-user" : "message-assistant")}>
            {message.content && (
                <div className="message-content prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                    </ReactMarkdown>
                </div>
            )}

            {!isUser && message.toolCalls?.map((toolCall) => {
                // Check if result has dynamic UI data
                // Priority: Result data > Input blocks (common for show_dynamic_ui)
                const dynamicData = toolCall.result?.uiData ||
                    (toolCall.result?.type === 'dynamic-ui' ? toolCall.result.data : null) ||
                    (toolCall.input?.blocks ? toolCall.input : null);

                // Get tool content (text parts) if available in the result
                const toolContentText = toolCall.result?.content
                    ?.filter((item: any) => item.type === "text")
                    ?.map((item: any) => item.text)
                    ?.join("\n\n");

                return (
                    <div key={toolCall.id} className="mcp-tool-call mt-3 flex flex-col gap-3">
                        {toolContentText && (
                            <div className="message-content prose prose-sm max-w-none dark:prose-invert italic opacity-80">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {toolContentText}
                                </ReactMarkdown>
                            </div>
                        )}

                        {dynamicData ? (
                            <DynamicRenderer data={dynamicData} />
                        ) : toolCall.uiHtml ? (
                            <div className="mcp-ui-container">
                                <iframe
                                    id={`iframe-${toolCall.id}`}
                                    srcDoc={toolCall.uiHtml}
                                    style={{ width: '100%', border: 'none', borderRadius: '8px', overflow: 'hidden' }}
                                    sandbox="allow-scripts allow-same-origin"
                                    title={`MCP UI: ${toolCall.name}`}
                                    scrolling="no"
                                />
                            </div>
                        ) : toolCall.result && !toolCall.uiResourceUri ? (
                            <Card className="bg-zinc-950/50 border-zinc-800/50">
                                <CardContent className="p-3">
                                    <pre className="text-xs text-zinc-400 overflow-x-auto">
                                        {JSON.stringify(toolCall.result, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
};
