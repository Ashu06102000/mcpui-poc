import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './components/MessageBubble';
import type { Message } from './lib/types';
import { Send, Cpu, Loader2, Sparkles } from 'lucide-react';
import { mcpManager } from './lib/mcp';
import { aiManager } from './lib/ai';
import { Button, Input, Card, Badge, Skeleton } from './components/ui';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your MCP-enabled assistant. All systems are online.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Configuration
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  const mcpUrl = 'http://localhost:3001/sse';


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mcpClient, setMcpClient] = useState<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Connect MCP if not connected
      if (!mcpClient) {
        const client = await mcpManager.connect(mcpUrl);
        setMcpClient(client);
      }

      // Initialize AI
      aiManager.init(apiKey);

      // Get tools from MCP
      const { tools } = await mcpManager.listTools();

      // Send to AI
      const assistantMessage = await aiManager.sendMessage(
        [...messages, userMessage],
        tools
      );

      // Handle tool calls if any
      if (assistantMessage.toolCalls) {
        for (const tc of assistantMessage.toolCalls) {
          try {
            const callResult = await mcpManager.callTool(tc.name, tc.input);
            tc.result = callResult.result;
            tc.uiResourceUri = callResult.uiResourceUri;
            tc.uiHtml = callResult.uiHtml;
          } catch (toolError: any) {
            console.error(`Tool call ${tc.name} failed:`, toolError);
            tc.result = { error: toolError.message };
          }
        }
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message || 'Unknown error'}. Please ensure a valid MCP server is running.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="chat-header glass flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Cpu className="text-blue-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Antigravity OS</h1>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="h-1.5 w-1.5 p-0 rounded-full animate-pulse" />
              <span className="text-xs text-zinc-400 font-medium">All systems operational</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 py-1 px-3">
            <Sparkles size={12} className="text-blue-400" />
            <span>Premium UI Kit</span>
          </Badge>
          <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
            <div className="h-2 w-2 rounded-full bg-zinc-700" />
          </Button>
        </div>
      </header>

      <main className="chat-messages p-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isLoading && (
          <Card className="max-w-[80%] border-none shadow-none bg-transparent">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={16} />
              </div>
              <div className="flex flex-col gap-2 w-full max-w-[200px]">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4 opacity-50" />
              </div>
            </div>
          </Card>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="chat-input-container p-4 bg-zinc-950/50 border-t border-zinc-800/50 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto">
          <Card className="flex items-center gap-2 p-1.5 bg-zinc-900/40 border-zinc-800/50 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
            <Input
              type="text"
              className="border-none bg-transparent focus:ring-0 focus:border-none shadow-none h-10 px-3"
              placeholder="Message Me..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="rounded-lg h-9 w-9 p-0 flex-shrink-0"
              variant={input.trim() ? "primary" : "ghost"}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </Button>
          </Card>
          <p className="text-[10px] text-zinc-500 text-center mt-2 font-medium uppercase tracking-widest opacity-50">
            I am awesome
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

