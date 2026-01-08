/**
 * Reporter Agent
 * Generates bi-weekly market intelligence reports and sends via email
 */

import { runAgent, type AgentTool } from '@/lib/ai/client';
import { getAnalyzedSignalsWithDetails } from '@/lib/db/analyzed-signals';
import { createReport, markReportAsSent } from '@/lib/db/reports';
import { startAgentRun, completeAgentRun } from '@/lib/db/agent-runs';
import { sendEmail } from '@/lib/email/client';
import { generateReportHtml, generateReportMarkdown, type ReportData, type ReportSignal } from '@/lib/email/templates/report';
import type { Priority, ReportInsert } from '@/types/database';

// ============================================================
// System Prompt
// ============================================================

const REPORTER_SYSTEM_PROMPT = `You are the Reporter Agent for E2's Market Intelligence system.

## Your Mission
Generate concise, actionable bi-weekly reports that help the Sales/BD team prioritize partnership outreach. Your reports should highlight the most promising opportunities and provide clear next steps.

## Report Structure
1. **Executive Summary**: One paragraph overview of key findings
2. **Top Opportunities**: HIGH priority signals that deserve immediate attention
3. **Worth Monitoring**: MEDIUM priority signals to track
4. **Industry News**: Relevant market trends or news
5. **Recommendations**: Strategic suggestions for the team

## Writing Style
- Be concise and action-oriented
- Use specific entity names and data points
- Highlight what makes each opportunity compelling
- Mention any risk flags or concerns
- Suggest specific outreach approaches where appropriate

## Data You'll Receive
- Analyzed signals with scores (0-14 scale)
- Score breakdowns: Market Entry, E2 Fit, Actionability, Data Confidence
- Priority levels: HIGH (≥10), MEDIUM (7-9), LOW (<7)
- Entity details: name, type, geo, signal type

Focus on quality insights over length. A short, punchy report is better than a long, rambling one.`;

// ============================================================
// Tool Definitions
// ============================================================

const REPORTER_TOOLS: AgentTool[] = [
    {
        name: 'generate_report_section',
        description: 'Generate a section of the report with AI-written content',
        input_schema: {
            type: 'object',
            properties: {
                section_type: {
                    type: 'string',
                    description: 'Type of section: executive_summary, news_highlights, or recommendations',
                    enum: ['executive_summary', 'news_highlights', 'recommendations'],
                },
                content: {
                    type: 'string',
                    description: 'The generated content for this section (markdown format)',
                },
            },
            required: ['section_type', 'content'],
        },
    },
    {
        name: 'finalize_report',
        description: 'Mark the report as complete and ready for sending',
        input_schema: {
            type: 'object',
            properties: {
                report_complete: {
                    type: 'boolean',
                    description: 'Set to true when the report is ready',
                },
            },
            required: ['report_complete'],
        },
    },
];

// ============================================================
// Types
// ============================================================

interface ReporterInput {
    cycleStart?: string;  // ISO date, defaults to 14 days ago
    cycleEnd?: string;    // ISO date, defaults to now
    recipientEmails?: string[];
    sendEmail?: boolean;  // Whether to actually send
}

interface ReporterOutput {
    reportId: string;
    signalsIncluded: number;
    emailSent: boolean;
    emailRecipients?: string[];
}

interface AgentResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
}

interface GeneratedSections {
    executive_summary?: string;
    news_highlights?: string[];
    recommendations?: string;
}

// ============================================================
// Data Fetching
// ============================================================

async function fetchReportData(cycleStart: string, cycleEnd: string): Promise<{
    signals: ReportSignal[];
    stats: ReportData['stats'];
}> {
    // Fetch analyzed signals with details
    const analyzedSignals = await getAnalyzedSignalsWithDetails(undefined, 100);

    // Filter by date range (if signals have dates)
    const signals: ReportSignal[] = analyzedSignals
        .filter(s => {
            const analyzedAt = new Date(s.analyzed_at);
            return analyzedAt >= new Date(cycleStart) && analyzedAt <= new Date(cycleEnd);
        })
        .map(s => ({
            id: s.id,
            entity_name: s.signal?.entity_name || 'Unknown',
            entity_type: s.signal?.entity_type || 'unknown',
            geo: s.signal?.geo || 'unknown',
            signal_type: s.signal?.signal_type || 'unknown',
            final_score: s.final_score || 0,
            priority: s.priority || 'LOW',
            score_breakdown: s.score_breakdown,
            recommended_actions: s.recommended_actions || [],
            ai_reasoning: s.ai_reasoning || '',
        }));

    // Calculate stats
    const byPriority = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    const byGeo: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalScore = 0;

    for (const signal of signals) {
        byPriority[signal.priority]++;
        byGeo[signal.geo] = (byGeo[signal.geo] || 0) + 1;
        byType[signal.entity_type] = (byType[signal.entity_type] || 0) + 1;
        totalScore += signal.final_score;
    }

    return {
        signals,
        stats: {
            total: signals.length,
            byPriority,
            byGeo,
            byType,
            avgScore: signals.length > 0 ? totalScore / signals.length : 0,
        },
    };
}

// ============================================================
// Main Reporter Function
// ============================================================

export async function runReporter(
    input: ReporterInput = {}
): Promise<AgentResult<ReporterOutput>> {
    // Set default date range (last 14 days)
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const cycleStart = input.cycleStart || twoWeeksAgo.toISOString();
    const cycleEnd = input.cycleEnd || now.toISOString();
    const shouldSendEmail = input.sendEmail !== false;
    const recipients = input.recipientEmails || [process.env.REPORT_RECIPIENT_EMAIL || 'team@e-2.at'];

    // Start agent run
    let agentRun;
    try {
        agentRun = await startAgentRun('reporter', { cycleStart, cycleEnd });
    } catch (err) {
        console.error('[Reporter] Failed to start agent run:', err);
        return { success: false, error: 'Failed to start agent run' };
    }

    try {
        // Fetch data for report
        console.log('[Reporter] Fetching report data...');
        const { signals, stats } = await fetchReportData(cycleStart, cycleEnd);

        if (signals.length === 0) {
            console.log('[Reporter] No signals in date range, generating empty report');
            await completeAgentRun(agentRun.id, {
                output_summary: { message: 'No signals to report' },
            });
            return {
                success: true,
                data: { reportId: '', signalsIncluded: 0, emailSent: false },
            };
        }

        // Separate by priority
        const highPriority = signals.filter(s => s.priority === 'HIGH');
        const mediumPriority = signals.filter(s => s.priority === 'MEDIUM');
        const lowPriority = signals.filter(s => s.priority === 'LOW');

        console.log(`[Reporter] Found ${signals.length} signals: ${highPriority.length} HIGH, ${mediumPriority.length} MEDIUM, ${lowPriority.length} LOW`);

        // Use AI to generate additional content
        const generatedSections: GeneratedSections = {};
        let totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

        // Build context for AI
        const signalSummary = signals.slice(0, 10).map(s =>
            `- ${s.entity_name} (${s.geo}, ${s.priority}): Score ${s.final_score}/14 - ${s.ai_reasoning?.slice(0, 100)}...`
        ).join('\n');

        const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
            {
                role: 'user',
                content: `Generate report sections for the following market intelligence data:

**Date Range:** ${cycleStart.split('T')[0]} to ${cycleEnd.split('T')[0]}
**Total Signals:** ${stats.total}
**Breakdown:** ${stats.byPriority.HIGH} HIGH, ${stats.byPriority.MEDIUM} MEDIUM, ${stats.byPriority.LOW} LOW
**Average Score:** ${stats.avgScore.toFixed(1)}/14
**Geos:** ${Object.entries(stats.byGeo).map(([g, c]) => `${g.toUpperCase()}:${c}`).join(', ')}

**Top Signals:**
${signalSummary}

Please use the generate_report_section tool to create:
1. An executive_summary (2-3 sentences highlighting key findings)
2. recommendations (1-2 strategic suggestions)

Then use finalize_report when done.`,
            },
        ];

        // Run agent loop
        let iterations = 0;
        const MAX_ITERATIONS = 5;
        let reportFinalized = false;

        while (iterations < MAX_ITERATIONS && !reportFinalized) {
            iterations++;

            const response = await runAgent({
                systemPrompt: REPORTER_SYSTEM_PROMPT,
                messages,
                tools: REPORTER_TOOLS,
                maxTokens: 2048,
            });

            if (response.error) {
                console.error('[Reporter] Agent error:', response.error);
                break;
            }

            if (response.usage) {
                totalUsage.inputTokens += response.usage.input_tokens;
                totalUsage.outputTokens += response.usage.output_tokens;
                totalUsage.totalTokens += response.usage.input_tokens + response.usage.output_tokens;
            }

            const toolUses = (response.content || []).filter(
                (block: { type: string }) => block.type === 'tool_use'
            );

            if (toolUses.length === 0) break;

            const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];

            for (const toolUse of toolUses) {
                const { id, name, input: toolInput } = toolUse as {
                    id: string;
                    name: string;
                    input: Record<string, unknown>;
                };

                if (name === 'generate_report_section') {
                    const sectionType = toolInput.section_type as keyof GeneratedSections;
                    const content = toolInput.content as string;

                    if (sectionType === 'news_highlights') {
                        generatedSections.news_highlights = [content];
                    } else {
                        generatedSections[sectionType] = content;
                    }

                    console.log(`[Reporter] Generated ${sectionType} section`);
                    toolResults.push({
                        type: 'tool_result',
                        tool_use_id: id,
                        content: JSON.stringify({ success: true, section: sectionType }),
                    });
                } else if (name === 'finalize_report') {
                    reportFinalized = true;
                    toolResults.push({
                        type: 'tool_result',
                        tool_use_id: id,
                        content: JSON.stringify({ success: true, finalized: true }),
                    });
                }
            }

            messages.push({
                role: 'assistant',
                content: JSON.stringify(response.content),
            });
            messages.push({
                role: 'user',
                content: JSON.stringify(toolResults),
            });
        }

        // Build report data
        const reportData: ReportData = {
            cycleStart,
            cycleEnd,
            highPriority,
            mediumPriority,
            lowPriority,
            stats,
            newsHighlights: generatedSections.news_highlights,
        };

        // Generate HTML and markdown
        const htmlContent = generateReportHtml(reportData);
        const markdownContent = generateReportMarkdown(reportData);

        // Prepend AI-generated sections to markdown
        let finalMarkdown = markdownContent;
        if (generatedSections.executive_summary) {
            finalMarkdown = markdownContent.replace(
                '## 📈 Summary',
                `## 📝 Executive Summary\n\n${generatedSections.executive_summary}\n\n## 📈 Summary`
            );
        }
        if (generatedSections.recommendations) {
            finalMarkdown += `\n## 💡 Recommendations\n\n${generatedSections.recommendations}\n`;
        }

        // Store report in database
        const reportInsert: ReportInsert = {
            cycle_start: cycleStart,
            cycle_end: cycleEnd,
            content_markdown: finalMarkdown,
            content_html: htmlContent,
            summary_stats: {
                totalSignals: stats.total,
                highPriority: stats.byPriority.HIGH,
                mediumPriority: stats.byPriority.MEDIUM,
                lowPriority: stats.byPriority.LOW,
                newEntities: signals.length,
                topGeos: Object.keys(stats.byGeo),
            },
        };

        const report = await createReport(reportInsert);
        console.log(`[Reporter] Created report: ${report.id}`);

        // Send email
        let emailSent = false;
        if (shouldSendEmail && recipients.length > 0) {
            const subject = `🎯 E2 Market Intelligence: ${stats.byPriority.HIGH} High Priority Opportunities`;

            const emailResult = await sendEmail({
                to: recipients,
                subject,
                html: htmlContent,
            });

            if (emailResult.success) {
                await markReportAsSent(report.id);
                emailSent = true;
                console.log(`[Reporter] Email sent to ${recipients.join(', ')}`);
            } else {
                console.error('[Reporter] Email failed:', emailResult.error);
            }
        }

        // Complete agent run
        await completeAgentRun(agentRun.id, {
            output_summary: {
                reportId: report.id,
                signalsIncluded: signals.length,
                emailSent,
            },
            token_usage: totalUsage,
        });

        return {
            success: true,
            data: {
                reportId: report.id,
                signalsIncluded: signals.length,
                emailSent,
                emailRecipients: emailSent ? recipients : undefined,
            },
            usage: totalUsage,
        };
    } catch (err) {
        console.error('[Reporter] Exception:', err);
        await completeAgentRun(agentRun.id, { error: String(err) });
        return { success: false, error: String(err) };
    }
}

/**
 * Generate a report without sending email (for testing)
 */
export async function generateReportPreview(
    cycleStart?: string,
    cycleEnd?: string
): Promise<AgentResult<{ html: string; markdown: string; stats: ReportData['stats'] }>> {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const start = cycleStart || twoWeeksAgo.toISOString();
    const end = cycleEnd || now.toISOString();

    try {
        const { signals, stats } = await fetchReportData(start, end);

        const highPriority = signals.filter(s => s.priority === 'HIGH');
        const mediumPriority = signals.filter(s => s.priority === 'MEDIUM');
        const lowPriority = signals.filter(s => s.priority === 'LOW');

        const reportData: ReportData = {
            cycleStart: start,
            cycleEnd: end,
            highPriority,
            mediumPriority,
            lowPriority,
            stats,
        };

        return {
            success: true,
            data: {
                html: generateReportHtml(reportData),
                markdown: generateReportMarkdown(reportData),
                stats,
            },
        };
    } catch (err) {
        return { success: false, error: String(err) };
    }
}
