/**
 * Market Intelligence Report Email Template
 * Bi-weekly email report for Sales/BD team
 */

import type { AnalyzedSignal, Priority, ScoreBreakdown } from '@/types/database';

// ============================================================
// Types
// ============================================================

export interface ReportSignal {
    id: string;
    entity_name: string;
    entity_type: string;
    geo: string;
    signal_type: string;
    final_score: number;
    priority: Priority;
    score_breakdown: ScoreBreakdown;
    recommended_actions: string[];
    ai_reasoning: string;
}

export interface ReportData {
    cycleStart: string;
    cycleEnd: string;
    highPriority: ReportSignal[];
    mediumPriority: ReportSignal[];
    lowPriority: ReportSignal[];
    stats: {
        total: number;
        byPriority: { HIGH: number; MEDIUM: number; LOW: number };
        byGeo: Record<string, number>;
        byType: Record<string, number>;
        avgScore: number;
    };
    newsHighlights?: string[];
}

// ============================================================
// Style Constants
// ============================================================

const COLORS = {
    primary: '#6366f1',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceLight: '#334155',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    high: '#ef4444',
    highBg: 'rgba(239, 68, 68, 0.15)',
    medium: '#f59e0b',
    mediumBg: 'rgba(245, 158, 11, 0.15)',
    low: '#22c55e',
    lowBg: 'rgba(34, 197, 94, 0.15)',
    border: '#334155',
};

// ============================================================
// Helper Functions
// ============================================================

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getPriorityColor(priority: Priority) {
    switch (priority) {
        case 'HIGH': return { color: COLORS.high, bg: COLORS.highBg };
        case 'MEDIUM': return { color: COLORS.medium, bg: COLORS.mediumBg };
        case 'LOW': return { color: COLORS.low, bg: COLORS.lowBg };
    }
}

function getGeoFlag(geo: string): string {
    const flags: Record<string, string> = {
        br: '🇧🇷',
        mx: '🇲🇽',
        ar: '🇦🇷',
        co: '🇨🇴',
        pe: '🇵🇪',
        cl: '🇨🇱',
    };
    return flags[geo.toLowerCase()] || '🌍';
}

// ============================================================
// Signal Card Component
// ============================================================

function renderSignalCard(signal: ReportSignal): string {
    const { color, bg } = getPriorityColor(signal.priority);
    const flag = getGeoFlag(signal.geo);

    return `
    <div style="background:${COLORS.surface}; border:1px solid ${COLORS.border}; border-radius:12px; padding:20px; margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
        <div>
          <h3 style="margin:0 0 4px 0; font-size:18px; color:${COLORS.text};">
            ${flag} ${signal.entity_name}
          </h3>
          <p style="margin:0; font-size:13px; color:${COLORS.textMuted};">
            ${signal.entity_type.toUpperCase()} • ${signal.geo.toUpperCase()} • ${signal.signal_type}
          </p>
        </div>
        <div style="text-align:right;">
          <span style="background:${bg}; color:${color}; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;">
            ${signal.priority}
          </span>
          <p style="margin:4px 0 0 0; font-size:14px; color:${COLORS.text}; font-weight:600;">
            Score: ${signal.final_score}/14
          </p>
        </div>
      </div>
      
      <div style="background:${COLORS.surfaceLight}; border-radius:8px; padding:12px; margin-bottom:12px;">
        <p style="margin:0; font-size:14px; color:${COLORS.text}; line-height:1.5;">
          ${signal.ai_reasoning || 'No reasoning provided.'}
        </p>
      </div>
      
      ${signal.recommended_actions && signal.recommended_actions.length > 0 ? `
      <div>
        <p style="margin:0 0 8px 0; font-size:12px; color:${COLORS.textMuted}; text-transform:uppercase; letter-spacing:0.5px;">
          Recommended Actions
        </p>
        <ul style="margin:0; padding-left:20px; color:${COLORS.text}; font-size:14px;">
          ${signal.recommended_actions.map(action => `<li style="margin-bottom:4px;">${action}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
    `;
}

// ============================================================
// Main Email Template
// ============================================================

export function generateReportHtml(data: ReportData): string {
    const { cycleStart, cycleEnd, highPriority, mediumPriority, stats } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E2 Market Intelligence Report</title>
</head>
<body style="margin:0; padding:0; background:${COLORS.background}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  <div style="max-width:680px; margin:0 auto; padding:32px 16px;">
    
    <!-- Header -->
    <div style="text-align:center; margin-bottom:32px;">
      <h1 style="margin:0 0 8px 0; font-size:28px; color:${COLORS.text};">
        🎯 Market Intelligence Report
      </h1>
      <p style="margin:0; font-size:14px; color:${COLORS.textMuted};">
        ${formatDate(cycleStart)} — ${formatDate(cycleEnd)}
      </p>
    </div>
    
    <!-- Stats Overview -->
    <div style="background:linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.surface}); border:1px solid ${COLORS.border}; border-radius:16px; padding:24px; margin-bottom:32px;">
      <div style="display:flex; justify-content:space-around; text-align:center;">
        <div>
          <p style="margin:0; font-size:32px; font-weight:700; color:${COLORS.text};">${stats.total}</p>
          <p style="margin:4px 0 0 0; font-size:12px; color:${COLORS.textMuted}; text-transform:uppercase;">Total Signals</p>
        </div>
        <div>
          <p style="margin:0; font-size:32px; font-weight:700; color:${COLORS.high};">${stats.byPriority.HIGH}</p>
          <p style="margin:4px 0 0 0; font-size:12px; color:${COLORS.textMuted}; text-transform:uppercase;">High Priority</p>
        </div>
        <div>
          <p style="margin:0; font-size:32px; font-weight:700; color:${COLORS.medium};">${stats.byPriority.MEDIUM}</p>
          <p style="margin:4px 0 0 0; font-size:12px; color:${COLORS.textMuted}; text-transform:uppercase;">Medium Priority</p>
        </div>
        <div>
          <p style="margin:0; font-size:32px; font-weight:700; color:${COLORS.text};">${stats.avgScore.toFixed(1)}</p>
          <p style="margin:4px 0 0 0; font-size:12px; color:${COLORS.textMuted}; text-transform:uppercase;">Avg Score</p>
        </div>
      </div>
    </div>
    
    <!-- High Priority Section -->
    ${highPriority.length > 0 ? `
    <div style="margin-bottom:32px;">
      <h2 style="margin:0 0 16px 0; font-size:20px; color:${COLORS.high};">
        🔥 Top Opportunities
      </h2>
      ${highPriority.map(s => renderSignalCard(s)).join('')}
    </div>
    ` : ''}
    
    <!-- Medium Priority Section -->
    ${mediumPriority.length > 0 ? `
    <div style="margin-bottom:32px;">
      <h2 style="margin:0 0 16px 0; font-size:20px; color:${COLORS.medium};">
        📊 Worth Monitoring
      </h2>
      ${mediumPriority.slice(0, 5).map(s => renderSignalCard(s)).join('')}
      ${mediumPriority.length > 5 ? `
      <p style="text-align:center; color:${COLORS.textMuted}; font-size:14px;">
        + ${mediumPriority.length - 5} more medium priority signals
      </p>
      ` : ''}
    </div>
    ` : ''}
    
    <!-- Geographic Breakdown -->
    ${Object.keys(stats.byGeo).length > 0 ? `
    <div style="background:${COLORS.surface}; border:1px solid ${COLORS.border}; border-radius:12px; padding:20px; margin-bottom:32px;">
      <h2 style="margin:0 0 16px 0; font-size:18px; color:${COLORS.text};">
        🌎 Geographic Breakdown
      </h2>
      <div style="display:flex; flex-wrap:wrap; gap:12px;">
        ${Object.entries(stats.byGeo).map(([geo, count]) => `
          <div style="background:${COLORS.surfaceLight}; padding:8px 16px; border-radius:8px;">
            <span style="font-size:16px;">${getGeoFlag(geo)}</span>
            <span style="color:${COLORS.text}; font-weight:600; margin-left:8px;">${count}</span>
            <span style="color:${COLORS.textMuted}; margin-left:4px;">${geo.toUpperCase()}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    <!-- Methodology Footer -->
    <div style="border-top:1px solid ${COLORS.border}; padding-top:24px; margin-top:32px;">
      <h3 style="margin:0 0 12px 0; font-size:14px; color:${COLORS.textMuted};">
        🔧 Methodology
      </h3>
      <p style="margin:0; font-size:13px; color:${COLORS.textMuted}; line-height:1.6;">
        Signals are scored on a 0-14 scale across four dimensions: Market Entry Momentum (0-4), 
        E2 Partnership Fit (0-4), Actionability (0-3), and Data Confidence (0-3). 
        HIGH priority ≥10, MEDIUM 7-9, LOW &lt;7. Data collected from NewsAPI, Google Trends, 
        and E2 partnership database.
      </p>
      <p style="margin:16px 0 0 0; font-size:12px; color:${COLORS.textMuted};">
        Generated by E2 Market Intelligence Agent • ${new Date().toISOString().split('T')[0]}
      </p>
    </div>
    
  </div>
</body>
</html>
    `;
}

// ============================================================
// Markdown Export
// ============================================================

export function generateReportMarkdown(data: ReportData): string {
    const { cycleStart, cycleEnd, highPriority, mediumPriority, lowPriority, stats } = data;

    let md = `# 🎯 Market Intelligence Report\n\n`;
    md += `**Period:** ${formatDate(cycleStart)} — ${formatDate(cycleEnd)}\n\n`;

    md += `## 📈 Summary\n\n`;
    md += `| Metric | Value |\n|--------|-------|\n`;
    md += `| Total Signals | ${stats.total} |\n`;
    md += `| High Priority | ${stats.byPriority.HIGH} |\n`;
    md += `| Medium Priority | ${stats.byPriority.MEDIUM} |\n`;
    md += `| Low Priority | ${stats.byPriority.LOW} |\n`;
    md += `| Avg Score | ${stats.avgScore.toFixed(1)}/14 |\n\n`;

    if (highPriority.length > 0) {
        md += `## 🔥 Top Opportunities\n\n`;
        for (const s of highPriority) {
            md += `### ${getGeoFlag(s.geo)} ${s.entity_name}\n\n`;
            md += `- **Type:** ${s.entity_type} | **Geo:** ${s.geo.toUpperCase()} | **Score:** ${s.final_score}/14\n`;
            md += `- **${s.ai_reasoning}**\n`;
            if (s.recommended_actions?.length > 0) {
                md += `- Actions: ${s.recommended_actions.join('; ')}\n`;
            }
            md += '\n';
        }
    }

    if (mediumPriority.length > 0) {
        md += `## 📊 Worth Monitoring\n\n`;
        for (const s of mediumPriority.slice(0, 5)) {
            md += `- **${s.entity_name}** (${s.geo.toUpperCase()}) — Score: ${s.final_score}/14\n`;
        }
        if (mediumPriority.length > 5) {
            md += `- *+ ${mediumPriority.length - 5} more*\n`;
        }
        md += '\n';
    }

    md += `---\n\n*Generated by E2 Market Intelligence Agent*\n`;

    return md;
}
