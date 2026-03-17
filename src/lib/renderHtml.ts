/**
 * This utility generates a standalone HTML string for dynamic UI blocks.
 * It uses the actual classes and variables from ui.css to ensure pixel-perfect consistency
 * with the native React components.
 */

const INDEX_CSS_VARS = `
:root {
  --background: #0a0a0c;
  --foreground: #f8f8f8;
  --card: #141417;
  --card-foreground: #f8f8f8;
  --popover: #141417;
  --popover-foreground: #f8f8f8;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --secondary: #27272a;
  --secondary-foreground: #f8f8f8;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --accent: #27272a;
  --accent-foreground: #f8f8f8;
  --border: #27272a;
  --input: #27272a;
  --ring: #3b82f6;
  --radius: 0.75rem;
  
  /* Additional tokens used in ui.css */
  --ui-radius-lg: 0.75rem;
  --ui-radius-md: 0.5rem;
  --ui-radius-sm: 0.25rem;
  --ui-card-border: rgba(39, 39, 42, 0.5);
}
`;

const UI_CSS_CONTENT = `
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.w-full { width: 100%; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.pt-0 { padding-top: 0; }
.pt-4 { padding-top: 1rem; }
.pt-6 { padding-top: 1.5rem; }
.pb-3 { padding-bottom: 0.75rem; }
.mb-1 { margin-bottom: 0.25rem; }
.border { border: 1px solid var(--ui-card-border); }
.border-b { border-bottom: 1px solid var(--ui-card-border); }
.border-t { border-top: 1px solid var(--ui-card-border); }
.border-zinc-800\\/50 { border-color: rgba(39, 39, 42, 0.5); }
.border-zinc-800\\/30 { border-color: rgba(39, 39, 42, 0.3); }
.rounded-xl { border-radius: var(--ui-radius-lg); }
.rounded-lg { border-radius: var(--ui-radius-md); }
.rounded-md { border-radius: var(--ui-radius-sm); }
.overflow-hidden { overflow: hidden; }
.bg-zinc-900\\/30 { background-color: rgba(24, 24, 27, 0.3); }
.bg-zinc-900\\/20 { background-color: rgba(24, 24, 27, 0.2); }
.bg-zinc-800\\/10 { background-color: rgba(39, 39, 42, 0.1); }
.bg-zinc-800\\/20 { background-color: rgba(39, 39, 42, 0.2); }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.uppercase { text-transform: uppercase; }
.tracking-wider { letter-spacing: 0.05em; }
.tracking-widest { letter-spacing: 0.1em; }
.text-white { color: #ffffff; }
.text-zinc-300 { color: #d4d4d8; }
.text-zinc-400 { color: #a1a1aa; }
.text-zinc-500 { color: #71717a; }
.backdrop-blur-xl { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
.ui-glass { background: rgba(20, 20, 23, 0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.ui-text-gradient { background: linear-gradient(to right, #ffffff, #a1a1aa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.ui-animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
`;

export function renderBlocksToHtml(data: any): string {
  const { title, icon, blocks } = data;

  const blocksArray = Array.isArray(blocks) ? blocks : (Array.isArray(data) ? data : []);
  const uiBlocks = blocksArray.filter((b: any) => b && ['stat-grid', 'list', 'alert', 'actions', 'chart'].includes(b.type));
  const textBlocks = blocksArray.filter((b: any) => b && b.type === 'text');

  let htmlContent = `
    <div class="flex flex-col gap-4 w-full ui-animate-fade-in">
        ${(textBlocks || []).map((b: any) => `<div class="text-sm text-zinc-300 opacity-90">${b.content}</div>`).join('')}

        ${uiBlocks.length > 0 ? `
        <div class="rounded-xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl overflow-hidden shadow-sm">
            <div class="p-6 border-b border-zinc-800/50 pb-3">
                <div class="flex items-center gap-3">
                    ${icon ? `<span class="text-2xl">${icon}</span>` : ''}
                    <h3 class="ui-text-gradient text-lg font-semibold">${title}</h3>
                </div>
            </div>
            <div class="p-6 pt-6 flex flex-col gap-6">
                ${(uiBlocks || []).map((block: any) => {
    switch (block.type) {
      case 'stat-grid':
        return `
                            <div class="grid grid-cols-2 gap-4">
                                ${Array.isArray(block.items) ? block.items.map((item: any) => `
                                <div class="p-4 rounded-xl bg-zinc-800/20 border border-zinc-800/50">
                                    <div class="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-1">${item.label}</div>
                                    <div class="text-xl font-bold text-white" style="${item.color ? `color: ${item.color}` : ''}">${item.value}</div>
                                </div>
                                `).join('') : ''}
                            </div>`;
      case 'list':
        return `
                            <div class="flex flex-col gap-2">
                                ${block.title ? `<h4 class="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">${block.title}</h4>` : ''}
                                <div class="rounded-xl border border-zinc-800/50 overflow-hidden">
                                    ${Array.isArray(block.items) ? block.items.map((item: any) => `
                                    <div class="flex items-center justify-between p-3 border-b border-zinc-800/30 last:border-0 bg-zinc-900/20">
                                        ${typeof item === 'string' ? `
                                            <span class="text-sm text-zinc-300">${item}</span>
                                        ` : `
                                            <span class="text-sm text-zinc-400">${item.label}</span>
                                            <span class="text-sm font-semibold text-white">${item.value}</span>
                                        `}
                                    </div>
                                    `).join('') : ''}
                                </div>
                            </div>`;
      case 'alert':
        return `
                            <div class="p-4 rounded-xl bg-zinc-800/10 border border-zinc-800/50 flex flex-col gap-2">
                                <span class="text-xs font-bold text-blue-400 uppercase tracking-widest">${block.title || 'Note'}</span>
                                <div class="text-sm text-zinc-300">${block.content}</div>
                            </div>`;
      case 'chart':
        return `
                            <div class="p-4 rounded-xl bg-zinc-800/20 border border-zinc-800/50 flex flex-col items-center justify-center gap-3 min-h-[150px]">
                                <div class="text-2xl opacity-50">📊</div>
                                <div class="text-sm font-medium text-zinc-400">Visual Chart: ${block.chartType}</div>
                                <div class="text-[10px] text-zinc-500 uppercase tracking-widest">Interactive version available in main UI</div>
                            </div>`;
    }
  }).join('')}
            </div>
            ${(Array.isArray(uiBlocks) && uiBlocks.some((b: any) => b.type === 'actions')) ? `
            <div class="p-6 border-t border-zinc-800/50 pt-4 flex flex-wrap gap-2">
                ${(() => {
          const actionBlock = uiBlocks.find((b: any) => b.type === 'actions');
          return (Array.isArray(actionBlock?.items) ? actionBlock.items.map((action: any) => `
                    <div class="${action.primary ? 'bg-blue-600 text-white' : 'border border-zinc-800 text-zinc-100'} px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer">
                        ${action.icon ? `<span>${action.icon}</span>` : ''}
                        ${action.label}
                    </div>
                    `).join('') : '');
        })()}
            </div>
            ` : ''}
        </div>
        ` : ''}
    </div>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${INDEX_CSS_VARS}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: transparent;
      color: var(--foreground);
      padding: 1rem;
      overflow: hidden;
    }
    ${UI_CSS_CONTENT}
  </style>
</head>
<body>
  ${htmlContent}
  <script>
    function sendHeight() {
      const height = document.body.scrollHeight;
      if (height > 0) {
        window.parent.postMessage({ type: 'resize', height: height + 32 }, '*');
      }
    }
    window.addEventListener('load', sendHeight);
    new ResizeObserver(sendHeight).observe(document.body);
    setInterval(sendHeight, 1000);
  </script>
</body>
</html>`;
}
