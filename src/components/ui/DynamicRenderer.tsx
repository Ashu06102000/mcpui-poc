import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge } from './index';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import './ui.css';

interface DynamicRendererProps {
    data: any;
}

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({ data }) => {
    if (!data || !data.blocks) return null;

    let { title, icon, blocks } = data;

    // Robust check for double-encoded blocks
    if (typeof blocks === 'string') {
        try {
            blocks = JSON.parse(blocks);
        } catch (e) {
            console.error("Failed to parse stringified blocks:", e);
        }
    }

    // Separate text blocks from UI blocks
    const uiBlocks = Array.isArray(blocks) ? blocks.filter((b: any) => ['stat-grid', 'list', 'alert', 'actions', 'chart'].includes(b.type)) : [];
    const textBlocks = Array.isArray(blocks) ? blocks.filter((b: any) => b.type === 'text') : [];

    return (
        <div className="flex flex-col gap-4 w-full ui-animate-fade-in">
            {/* Render any leading text blocks */}
            {(textBlocks || []).map((block: any, index: number) => (
                <div key={`text-${index}`} className="message-content prose prose-sm max-w-none dark:prose-invert opacity-90 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {block.content}
                    </ReactMarkdown>
                </div>
            ))}

            {/* Render UI blocks in a Card if they exist */}
            {uiBlocks.length > 0 && (
                <Card className="w-full overflow-hidden border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl">
                    <CardHeader className="border-b border-zinc-800/50 pb-3">
                        <div className="flex items-center gap-3">
                            {icon && <span className="text-2xl">{icon}</span>}
                            <CardTitle className="ui-text-gradient text-lg">{title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 flex flex-col gap-6">
                        {uiBlocks.map((block: any, index: number) => {
                            switch (block.type) {
                                case 'stat-grid':
                                    return (
                                        <div key={index} className="grid grid-cols-2 gap-4">
                                            {Array.isArray(block.items) ? block.items.map((item: any, i: number) => (
                                                <div key={i} className="p-4 rounded-xl bg-zinc-800/20 border border-zinc-800/50">
                                                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">{item.label}</div>
                                                    <div className="text-xl font-bold text-white tabular-nums" style={item.color ? { color: item.color } : {}}>
                                                        {item.value}
                                                    </div>
                                                </div>
                                            )) : null}
                                        </div>
                                    );
                                case 'list':
                                    return (
                                        <div key={index} className="flex flex-col gap-2">
                                            {block.title && <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">{block.title}</h4>}
                                            <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
                                                {Array.isArray(block.items) ? block.items.map((item: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between p-3 border-b border-zinc-800/30 last:border-0 bg-zinc-900/20 hover:bg-zinc-800/30 transition-colors">
                                                        {typeof item === 'string' ? (
                                                            <span className="text-sm text-zinc-300">{item}</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm text-zinc-400">{item.label}</span>
                                                                <span className="text-sm font-semibold text-white">{item.value}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )) : null}
                                            </div>
                                        </div>
                                    );
                                case 'alert':
                                    const alertVariants: Record<string, any> = {
                                        info: 'default',
                                        success: 'success',
                                        warning: 'warning',
                                        error: 'danger'
                                    };
                                    return (
                                        <div key={index} className="p-4 rounded-xl bg-zinc-800/10 border border-zinc-800/50 flex flex-col gap-2 relative overflow-hidden group">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={alertVariants[block.alertType || 'info'] as any}>
                                                    {block.title || 'Note'}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-zinc-300 leading-relaxed">{block.content}</div>
                                        </div>
                                    );
                                case 'chart':
                                    const { chartType, data: chartData, config = {} } = block;

                                    // 1. Sanitize data (strings to numbers if possible)
                                    const sanitizedData = Array.isArray(chartData) ? chartData.map(item => {
                                        const newItem = { ...item };
                                        Object.keys(newItem).forEach(key => {
                                            const val = newItem[key];
                                            // Handle currency, percentages, and commas
                                            if (typeof val === 'string' && val.trim() !== '') {
                                                const numericVal = val.replace(/[^0-9.-]+/g, "");
                                                if (numericVal !== '' && !isNaN(Number(numericVal))) {
                                                    newItem[key] = Number(numericVal);
                                                }
                                            }
                                        });
                                        return newItem;
                                    }) : [];

                                    if (sanitizedData.length === 0) return null;

                                    const chartColors = (config?.colors && config.colors.length > 0) ? config.colors : ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                                    const sampleItem = sanitizedData[0] || {};
                                    const dataKeys = Object.keys(sampleItem);

                                    // X-Axis Key Detection
                                    // Prefer keys like 'name', 'label', 'date', 'month', or the first non-numeric key
                                    const xKeyPriority = ['name', 'label', 'date', 'month', 'category', 'item'];
                                    const foundXKey = dataKeys.find(k => xKeyPriority.includes(k.toLowerCase())) ||
                                        dataKeys.find(k => typeof sampleItem[k] !== 'number') ||
                                        dataKeys[0] || 'name';

                                    const effectiveXKey = config.xAxisKey || foundXKey;

                                    // Series Detection (for Bar/Line)
                                    let effectiveSeries = config.series;
                                    if ((!effectiveSeries || effectiveSeries.length === 0) && (chartType === 'line' || chartType === 'bar')) {
                                        const numericKeys = dataKeys.filter(k => k !== effectiveXKey && typeof sampleItem[k] === 'number');
                                        effectiveSeries = numericKeys.length > 0
                                            ? numericKeys.map(k => ({ key: k, label: k }))
                                            : [{ key: dataKeys.find(k => k !== effectiveXKey) || 'value', label: 'Value' }];
                                    }

                                    return (
                                        <div key={index} className="w-full min-h-[300px] p-2 mt-2 rounded-xl bg-zinc-800/20 border border-zinc-800/50 overflow-hidden flex flex-col">
                                            <div className="flex-1 min-h-0 w-full relative">
                                                <ResponsiveContainer width="100%" height={280}>
                                                    {chartType === 'line' ? (
                                                        <LineChart data={sanitizedData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                                            <XAxis
                                                                dataKey={effectiveXKey}
                                                                stroke="#71717a"
                                                                fontSize={10}
                                                                tickLine={false}
                                                                axisLine={false}
                                                                dy={10}
                                                            />
                                                            <YAxis
                                                                stroke="#71717a"
                                                                fontSize={10}
                                                                tickLine={false}
                                                                axisLine={false}
                                                                tickFormatter={(val) => config.yAxisFormatter ? `${val}${config.yAxisFormatter}` : val}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{
                                                                    backgroundColor: '#18181b',
                                                                    borderColor: '#27272a',
                                                                    color: '#fff',
                                                                    borderRadius: '8px',
                                                                    fontSize: '12px'
                                                                }}
                                                                itemStyle={{ color: '#fff' }}
                                                            />
                                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                                            {(effectiveSeries || []).map((s: any, i: number) => (
                                                                <Line
                                                                    key={i}
                                                                    type="monotone"
                                                                    dataKey={s.key}
                                                                    name={s.label}
                                                                    stroke={s.color || chartColors[i % chartColors.length]}
                                                                    strokeWidth={2}
                                                                    dot={{ r: 4, strokeWidth: 2 }}
                                                                    activeDot={{ r: 6 }}
                                                                />
                                                            ))}
                                                        </LineChart>
                                                    ) : chartType === 'bar' ? (
                                                        <BarChart data={sanitizedData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                                            <XAxis
                                                                dataKey={effectiveXKey}
                                                                stroke="#71717a"
                                                                fontSize={10}
                                                                tickLine={false}
                                                                axisLine={false}
                                                                dy={10}
                                                            />
                                                            <YAxis
                                                                stroke="#71717a"
                                                                fontSize={10}
                                                                tickLine={false}
                                                                axisLine={false}
                                                                tickFormatter={(val) => config.yAxisFormatter ? `${val}${config.yAxisFormatter}` : val}
                                                            />
                                                            <Tooltip
                                                                cursor={{ fill: '#27272a', opacity: 0.4 }}
                                                                contentStyle={{
                                                                    backgroundColor: '#18181b',
                                                                    borderColor: '#27272a',
                                                                    color: '#fff',
                                                                    borderRadius: '8px',
                                                                    fontSize: '12px'
                                                                }}
                                                            />
                                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                                            {(effectiveSeries || []).map((s: any, i: number) => (
                                                                <Bar
                                                                    key={i}
                                                                    dataKey={s.key}
                                                                    name={s.label}
                                                                    fill={s.color || chartColors[i % chartColors.length]}
                                                                    radius={[4, 4, 0, 0]}
                                                                    barSize={30}
                                                                />
                                                            ))}
                                                        </BarChart>
                                                    ) : chartType === 'pie' ? (
                                                        <PieChart>
                                                            <Pie
                                                                data={sanitizedData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={70}
                                                                outerRadius={90}
                                                                paddingAngle={5}
                                                                dataKey={config.valueKey || dataKeys.find(k => typeof sampleItem[k] === 'number') || 'value'}
                                                                nameKey={config.nameKey || effectiveXKey || 'name'}
                                                            >
                                                                {(sanitizedData || []).map((_entry: any, i: number) => (
                                                                    <Cell key={`cell-${i}`} fill={chartColors[i % chartColors.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip
                                                                contentStyle={{
                                                                    backgroundColor: '#18181b',
                                                                    borderColor: '#27272a',
                                                                    color: '#fff',
                                                                    borderRadius: '8px',
                                                                    fontSize: '12px'
                                                                }}
                                                            />
                                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                                        </PieChart>
                                                    ) : null}
                                                </ResponsiveContainer>
                                            </div>
                                            {/* Debug info hidden in DOM for subagent to read */}
                                            <div id="chart-debug-info" style={{ display: 'none' }}>
                                                {JSON.stringify({
                                                    chartType,
                                                    effectiveXKey,
                                                    effectiveSeries,
                                                    dataSample: sanitizedData[0]
                                                })}
                                            </div>
                                        </div>
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </CardContent>
                    {(() => {
                        const actionBlock = uiBlocks.find((b: any) => b.type === 'actions');
                        if (!actionBlock || !Array.isArray(actionBlock.items)) return null;
                        return (
                            <CardFooter className="border-t border-zinc-800/50 pt-4 flex flex-wrap gap-2">
                                {actionBlock.items.map((action: any, i: number) => (
                                    <Button
                                        key={i}
                                        variant={action.primary ? 'primary' : 'outline'}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        {action.icon && <span>{action.icon}</span>}
                                        {action.label}
                                    </Button>
                                ))}
                            </CardFooter>
                        );
                    })()}
                </Card>
            )}
        </div>
    );
};
