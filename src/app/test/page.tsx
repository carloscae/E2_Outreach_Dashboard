/**
 * Test Page - Signal Collection & Dashboard Testing
 * 
 * Development tool to trigger collection and view results.
 * Includes full pipeline testing (Collect → Analyze → Report).
 * Uses shadcn/ui components as per project standards.
 */

'use client';

import { useState, useCallback } from 'react';

interface Signal {
    id: string;
    entity_name: string;
    entity_type: string;
    geo: string;
    signal_type: string;
    preliminary_score: number | null;
    collected_at: string;
    final_score: number | null;
    priority: 'HIGH' | 'MEDIUM' | 'LOW' | null;
    feedback_count: number;
}

interface Stats {
    total: number;
    by_type: Record<string, number>;
    by_priority: Record<string, number>;
}

interface CollectionResult {
    success: boolean;
    data?: {
        signalsFound: number;
        signalsStored: number;
        runId: string;
        geo: string;
    };
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    error?: string;
}

interface AnalysisResult {
    success: boolean;
    data?: {
        signalsAnalyzed: number;
        highPriority: number;
        mediumPriority: number;
        lowPriority: number;
        runId: string;
    };
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    error?: string;
}

interface ReportResult {
    success: boolean;
    data?: {
        reportId: string;
        emailSent: boolean;
        recipients: string[];
        periodStart: string;
        periodEnd: string;
    };
    preview?: boolean;
    html?: string;
    markdown?: string;
    stats?: {
        totalSignals: number;
        highPriority: number;
        mediumPriority: number;
        lowPriority: number;
    };
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    error?: string;
}

interface DashboardResult {
    success: boolean;
    signals: Signal[];
    stats: Stats | null;
    count: number;
    error?: string;
}

interface PipelineStatus {
    collect: 'pending' | 'running' | 'success' | 'error';
    analyze: 'pending' | 'running' | 'success' | 'error';
    report: 'pending' | 'running' | 'success' | 'error';
}

export default function TestPage() {
    const [isCollecting, setIsCollecting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRunningPipeline, setIsRunningPipeline] = useState(false);

    const [collectionResult, setCollectionResult] = useState<CollectionResult | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [reportResult, setReportResult] = useState<ReportResult | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardResult | null>(null);
    const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);

    const [geo, setGeo] = useState('br');
    const [logs, setLogs] = useState<string[]>([]);
    const [showReportPreview, setShowReportPreview] = useState(false);

    const addLog = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
    }, []);

    const triggerCollection = async (): Promise<CollectionResult> => {
        setIsCollecting(true);
        setCollectionResult(null);
        addLog(`🚀 Starting collection for geo: ${geo}`);

        try {
            const response = await fetch('/api/collect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ geo, daysBack: 7 }),
            });

            const result = await response.json();
            setCollectionResult(result);

            if (result.success) {
                addLog(`✅ Collection complete: ${result.data?.signalsFound} signals found, ${result.data?.signalsStored} stored`);
                addLog(`   Token usage: ${result.usage?.totalTokens} total`);
            } else {
                addLog(`❌ Collection failed: ${result.error}`);
            }
            return result;
        } catch (err) {
            const errorMessage = String(err);
            const result = { success: false, error: errorMessage };
            setCollectionResult(result);
            addLog(`❌ Exception: ${errorMessage}`);
            return result;
        } finally {
            setIsCollecting(false);
        }
    };

    const triggerAnalysis = async (): Promise<AnalysisResult> => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        addLog(`🔍 Starting analysis of unanalyzed signals...`);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            const result = await response.json();
            setAnalysisResult(result);

            if (result.success) {
                const data = result.data;
                addLog(`✅ Analysis complete: ${data?.signalsAnalyzed} signals analyzed`);
                addLog(`   Priority breakdown: HIGH=${data?.highPriority}, MEDIUM=${data?.mediumPriority}, LOW=${data?.lowPriority}`);
                addLog(`   Token usage: ${result.usage?.totalTokens} total`);
            } else {
                addLog(`❌ Analysis failed: ${result.error}`);
            }
            return result;
        } catch (err) {
            const errorMessage = String(err);
            const result = { success: false, error: errorMessage };
            setAnalysisResult(result);
            addLog(`❌ Exception: ${errorMessage}`);
            return result;
        } finally {
            setIsAnalyzing(false);
        }
    };

    const triggerReport = async (preview = true, sendEmail = false): Promise<ReportResult> => {
        setIsReporting(true);
        setReportResult(null);
        addLog(`📧 ${preview ? 'Generating report preview' : 'Generating and sending report'}...`);

        try {
            const response = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preview, sendEmail }),
            });

            const result = await response.json();
            setReportResult(result);

            if (result.success) {
                if (preview) {
                    addLog(`✅ Report preview generated`);
                    addLog(`   Stats: ${result.stats?.totalSignals} total, ${result.stats?.highPriority} high priority`);
                } else {
                    addLog(`✅ Report generated: ${result.data?.reportId}`);
                    addLog(`   Email sent: ${result.data?.emailSent ? 'Yes' : 'No'}`);
                }
            } else {
                addLog(`❌ Report generation failed: ${result.error}`);
            }
            return result;
        } catch (err) {
            const errorMessage = String(err);
            const result = { success: false, error: errorMessage };
            setReportResult(result);
            addLog(`❌ Exception: ${errorMessage}`);
            return result;
        } finally {
            setIsReporting(false);
        }
    };

    const runFullPipeline = async () => {
        setIsRunningPipeline(true);
        setPipelineStatus({ collect: 'running', analyze: 'pending', report: 'pending' });
        addLog(`🔄 ═══════════════════════════════════════`);
        addLog(`🔄 Starting FULL PIPELINE: Collect → Analyze → Report`);
        addLog(`🔄 ═══════════════════════════════════════`);

        try {
            // Step 1: Collect
            const collectResult = await triggerCollection();
            if (!collectResult.success) {
                setPipelineStatus(prev => prev ? { ...prev, collect: 'error' } : null);
                addLog(`❌ Pipeline aborted: Collection failed`);
                return;
            }
            setPipelineStatus(prev => prev ? { ...prev, collect: 'success', analyze: 'running' } : null);

            // Brief pause between stages
            await new Promise(r => setTimeout(r, 1000));

            // Step 2: Analyze
            const analyzeResult = await triggerAnalysis();
            if (!analyzeResult.success) {
                setPipelineStatus(prev => prev ? { ...prev, analyze: 'error' } : null);
                addLog(`❌ Pipeline aborted: Analysis failed`);
                return;
            }
            setPipelineStatus(prev => prev ? { ...prev, analyze: 'success', report: 'running' } : null);

            // Brief pause between stages
            await new Promise(r => setTimeout(r, 1000));

            // Step 3: Report (preview only by default)
            const reportResult = await triggerReport(true, false);
            if (!reportResult.success) {
                setPipelineStatus(prev => prev ? { ...prev, report: 'error' } : null);
                addLog(`❌ Pipeline finished with report error`);
                return;
            }
            setPipelineStatus(prev => prev ? { ...prev, report: 'success' } : null);

            addLog(`🔄 ═══════════════════════════════════════`);
            addLog(`✅ FULL PIPELINE COMPLETE!`);
            addLog(`   Signals collected: ${collectResult.data?.signalsStored}`);
            addLog(`   Signals analyzed: ${analyzeResult.data?.signalsAnalyzed}`);
            addLog(`   Report ready: ${reportResult.stats?.totalSignals} signals in report`);
            addLog(`🔄 ═══════════════════════════════════════`);

            setShowReportPreview(true);
        } finally {
            setIsRunningPipeline(false);
        }
    };

    const fetchDashboard = async () => {
        setIsLoading(true);
        addLog(`📊 Fetching dashboard data for geo: ${geo || 'all'}`);

        try {
            const params = new URLSearchParams();
            if (geo) params.set('geo', geo);
            params.set('limit', '50');

            const response = await fetch(`/api/dashboard?${params.toString()}`);
            const result = await response.json();
            setDashboardData(result);

            if (result.success) {
                addLog(`✅ Loaded ${result.count} signals`);
            } else {
                addLog(`❌ Dashboard fetch failed: ${result.error}`);
            }
        } catch (err) {
            const errorMessage = String(err);
            setDashboardData({ success: false, signals: [], stats: null, count: 0, error: errorMessage });
            addLog(`❌ Exception: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const getPriorityColor = (priority: string | null) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return '⏸️';
            case 'running': return '⏳';
            case 'success': return '✅';
            case 'error': return '❌';
            default: return '❔';
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        🧪 Pipeline Test Console
                    </h1>
                    <p className="text-zinc-400">
                        Full pipeline testing: Collect → Analyze → Report
                    </p>
                </div>

                {/* Main Controls */}
                <div className="flex flex-wrap gap-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-zinc-400">Geo:</label>
                        <select
                            value={geo}
                            onChange={(e) => setGeo(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="br">🇧🇷 Brazil (POC)</option>
                            <option value="mx">🇲🇽 Mexico</option>
                            <option value="ar">🇦🇷 Argentina</option>
                        </select>
                    </div>

                    <div className="h-8 w-px bg-zinc-700" />

                    {/* Full Pipeline Button - Primary Action */}
                    <button
                        onClick={runFullPipeline}
                        disabled={isRunningPipeline || isCollecting || isAnalyzing || isReporting}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                        {isRunningPipeline ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Running Pipeline...
                            </>
                        ) : (
                            <>🔄 Run Full Pipeline</>
                        )}
                    </button>

                    <div className="h-8 w-px bg-zinc-700" />

                    {/* Individual Stage Buttons */}
                    <button
                        onClick={() => triggerCollection()}
                        disabled={isCollecting || isRunningPipeline}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        {isCollecting ? <span className="animate-spin">⏳</span> : '📡'} Collect
                    </button>

                    <button
                        onClick={() => triggerAnalysis()}
                        disabled={isAnalyzing || isRunningPipeline}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        {isAnalyzing ? <span className="animate-spin">⏳</span> : '🔍'} Analyze
                    </button>

                    <button
                        onClick={() => triggerReport(true, false)}
                        disabled={isReporting || isRunningPipeline}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        {isReporting ? <span className="animate-spin">⏳</span> : '📧'} Report
                    </button>

                    <div className="h-8 w-px bg-zinc-700" />

                    <button
                        onClick={fetchDashboard}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        {isLoading ? <span className="animate-spin">⏳</span> : '📊'} Dashboard
                    </button>

                    <a
                        href="/dashboard"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        🖥️ Open Dashboard UI
                    </a>
                </div>

                {/* Pipeline Status */}
                {pipelineStatus && (
                    <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                        <h3 className="text-sm font-semibold text-zinc-400 mb-3">Pipeline Status</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span>{getStatusIcon(pipelineStatus.collect)}</span>
                                <span className="text-sm">Collect</span>
                            </div>
                            <div className="text-zinc-600">→</div>
                            <div className="flex items-center gap-2">
                                <span>{getStatusIcon(pipelineStatus.analyze)}</span>
                                <span className="text-sm">Analyze</span>
                            </div>
                            <div className="text-zinc-600">→</div>
                            <div className="flex items-center gap-2">
                                <span>{getStatusIcon(pipelineStatus.report)}</span>
                                <span className="text-sm">Report</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Collection Result */}
                    {collectionResult && (
                        <div className={`p-6 rounded-xl border ${collectionResult.success ? 'bg-green-900/20 border-green-700/50' : 'bg-red-900/20 border-red-700/50'}`}>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                {collectionResult.success ? '✅' : '❌'} Collection
                            </h2>
                            {collectionResult.success ? (
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-zinc-400">Signals Found:</span> {collectionResult.data?.signalsFound}</p>
                                    <p><span className="text-zinc-400">Signals Stored:</span> {collectionResult.data?.signalsStored}</p>
                                    <p><span className="text-zinc-400">Run ID:</span> <code className="text-xs bg-zinc-800 px-2 py-0.5 rounded">{collectionResult.data?.runId?.slice(0, 8)}...</code></p>
                                    <p><span className="text-zinc-400">Tokens:</span> {collectionResult.usage?.totalTokens}</p>
                                </div>
                            ) : (
                                <p className="text-red-400 text-sm">{collectionResult.error}</p>
                            )}
                        </div>
                    )}

                    {/* Analysis Result */}
                    {analysisResult && (
                        <div className={`p-6 rounded-xl border ${analysisResult.success ? 'bg-amber-900/20 border-amber-700/50' : 'bg-red-900/20 border-red-700/50'}`}>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                {analysisResult.success ? '✅' : '❌'} Analysis
                            </h2>
                            {analysisResult.success ? (
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-zinc-400">Signals Analyzed:</span> {analysisResult.data?.signalsAnalyzed}</p>
                                    <p><span className="text-red-400">HIGH:</span> {analysisResult.data?.highPriority}</p>
                                    <p><span className="text-yellow-400">MEDIUM:</span> {analysisResult.data?.mediumPriority}</p>
                                    <p><span className="text-green-400">LOW:</span> {analysisResult.data?.lowPriority}</p>
                                    <p><span className="text-zinc-400">Tokens:</span> {analysisResult.usage?.totalTokens}</p>
                                </div>
                            ) : (
                                <p className="text-red-400 text-sm">{analysisResult.error}</p>
                            )}
                        </div>
                    )}

                    {/* Report Result */}
                    {reportResult && (
                        <div className={`p-6 rounded-xl border ${reportResult.success ? 'bg-emerald-900/20 border-emerald-700/50' : 'bg-red-900/20 border-red-700/50'}`}>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                {reportResult.success ? '✅' : '❌'} Report
                            </h2>
                            {reportResult.success ? (
                                <div className="space-y-2 text-sm">
                                    {reportResult.preview ? (
                                        <>
                                            <p><span className="text-zinc-400">Mode:</span> Preview</p>
                                            <p><span className="text-zinc-400">Total Signals:</span> {reportResult.stats?.totalSignals}</p>
                                            <p><span className="text-red-400">HIGH:</span> {reportResult.stats?.highPriority}</p>
                                            <p><span className="text-yellow-400">MEDIUM:</span> {reportResult.stats?.mediumPriority}</p>
                                            <button
                                                onClick={() => setShowReportPreview(!showReportPreview)}
                                                className="mt-2 text-blue-400 hover:text-blue-300 text-xs"
                                            >
                                                {showReportPreview ? 'Hide Preview' : 'Show Preview'}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p><span className="text-zinc-400">Report ID:</span> <code className="text-xs bg-zinc-800 px-2 py-0.5 rounded">{reportResult.data?.reportId?.slice(0, 8)}...</code></p>
                                            <p><span className="text-zinc-400">Email Sent:</span> {reportResult.data?.emailSent ? '✅ Yes' : '❌ No'}</p>
                                            {reportResult.data?.recipients && (
                                                <p><span className="text-zinc-400">Recipients:</span> {reportResult.data.recipients.join(', ')}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <p className="text-red-400 text-sm">{reportResult.error}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Report Preview */}
                {showReportPreview && reportResult?.html && (
                    <div className="rounded-xl bg-white overflow-hidden border border-zinc-800">
                        <div className="p-4 bg-zinc-800 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">📧 Email Preview</h2>
                            <button
                                onClick={() => setShowReportPreview(false)}
                                className="text-zinc-400 hover:text-zinc-200"
                            >
                                ✕
                            </button>
                        </div>
                        <div
                            className="p-4 max-h-[600px] overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: reportResult.html }}
                        />
                    </div>
                )}

                {/* Stats */}
                {dashboardData?.stats && (
                    <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
                        <h2 className="text-lg font-semibold mb-4">📈 Dashboard Stats</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="p-4 bg-zinc-800/50 rounded-lg">
                                <p className="text-zinc-400 mb-1">Total Signals</p>
                                <p className="text-2xl font-bold">{dashboardData.stats.total}</p>
                            </div>
                            <div className="p-4 bg-zinc-800/50 rounded-lg">
                                <p className="text-zinc-400 mb-2">By Type</p>
                                {Object.entries(dashboardData.stats.by_type).map(([type, count]) => (
                                    <p key={type} className="text-sm">{type}: <span className="text-blue-400">{count}</span></p>
                                ))}
                            </div>
                            <div className="p-4 bg-zinc-800/50 rounded-lg col-span-2">
                                <p className="text-zinc-400 mb-2">By Priority</p>
                                <div className="flex gap-4">
                                    {Object.entries(dashboardData.stats.by_priority).map(([priority, count]) => (
                                        <div key={priority} className={`px-3 py-1 rounded ${getPriorityColor(priority)}`}>
                                            {priority}: {count}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Signals Table */}
                {dashboardData && dashboardData.signals.length > 0 && (
                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                        <div className="p-4 border-b border-zinc-800">
                            <h2 className="text-lg font-semibold">📋 Signals ({dashboardData.count})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-800/50">
                                    <tr>
                                        <th className="text-left p-4 text-zinc-400 font-medium">Entity</th>
                                        <th className="text-left p-4 text-zinc-400 font-medium">Type</th>
                                        <th className="text-left p-4 text-zinc-400 font-medium">Signal</th>
                                        <th className="text-left p-4 text-zinc-400 font-medium">Priority</th>
                                        <th className="text-left p-4 text-zinc-400 font-medium">Score</th>
                                        <th className="text-left p-4 text-zinc-400 font-medium">Collected</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {dashboardData.signals.map((signal) => (
                                        <tr key={signal.id} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="p-4 font-medium">{signal.entity_name}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 rounded bg-zinc-700 text-xs">
                                                    {signal.entity_type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-zinc-400">{signal.signal_type}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded border text-xs ${getPriorityColor(signal.priority)}`}>
                                                    {signal.priority || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {signal.final_score ?? signal.preliminary_score ?? '-'}
                                            </td>
                                            <td className="p-4 text-zinc-500 text-xs">
                                                {new Date(signal.collected_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Console Log */}
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                        <h2 className="text-lg font-semibold font-mono">🖥️ Console</h2>
                        <button
                            onClick={() => setLogs([])}
                            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="p-4 font-mono text-xs space-y-1 max-h-80 overflow-y-auto bg-black/30">
                        {logs.length === 0 ? (
                            <p className="text-zinc-600">No logs yet. Run the pipeline or trigger individual stages.</p>
                        ) : (
                            logs.map((log, i) => (
                                <p key={i} className="text-zinc-400">{log}</p>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

