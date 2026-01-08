/**
 * Evidence Panel Component
 * Displays evidence links, AI reasoning, risk flags, and recommended actions
 */

"use client";

import { ExternalLink, Brain, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SignalEvidence, RiskFlags } from "@/types/database";

interface EvidencePanelProps {
    evidence: SignalEvidence[];
    sourceUrls: string[] | null;
    aiReasoning: string | null;
    riskFlags: RiskFlags | null;
    recommendedActions: string[] | null;
    className?: string;
}

export function EvidencePanel({
    evidence,
    sourceUrls,
    aiReasoning,
    riskFlags,
    recommendedActions,
    className = "",
}: EvidencePanelProps) {
    const [reasoningOpen, setReasoningOpen] = useState(false);

    const hasEvidence = evidence.length > 0 || (sourceUrls && sourceUrls.length > 0);
    const hasRiskFlags = riskFlags && (riskFlags.regulatory || riskFlags.reputational || riskFlags.financial);
    const hasActions = recommendedActions && recommendedActions.length > 0;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Evidence Links */}
            {hasEvidence && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Evidence Sources
                    </h4>
                    <div className="space-y-1.5">
                        {evidence.map((item, idx) => (
                            <div key={idx} className="text-sm">
                                {item.url ? (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-start gap-1"
                                    >
                                        <ExternalLink className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span className="line-clamp-2">
                                            {item.headline || item.description || item.source}
                                        </span>
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground">
                                        {item.headline || item.description || item.source}
                                    </span>
                                )}
                                {item.publishedAt && (
                                    <span className="text-xs text-muted-foreground ml-4">
                                        {new Date(item.publishedAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                )}
                            </div>
                        ))}
                        {sourceUrls && sourceUrls.filter(url => !evidence.some(e => e.url === url)).map((url, idx) => (
                            <a
                                key={`url-${idx}`}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                <span className="truncate">{url}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Risk Flags */}
            {hasRiskFlags && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                        Risk Flags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {riskFlags.regulatory && (
                            <Badge variant="destructive" className="text-xs">
                                Regulatory Risk
                            </Badge>
                        )}
                        {riskFlags.reputational && (
                            <Badge variant="warning" className="text-xs">
                                Reputational Risk
                            </Badge>
                        )}
                        {riskFlags.financial && (
                            <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                Financial Risk
                            </Badge>
                        )}
                    </div>
                    {riskFlags.notes && riskFlags.notes.length > 0 && (
                        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                            {riskFlags.notes.map((note, idx) => (
                                <li key={idx}>{note}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Recommended Actions */}
            {hasActions && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                        Recommended Actions
                    </h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        {recommendedActions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* AI Reasoning (Collapsible) */}
            {aiReasoning && (
                <Collapsible open={reasoningOpen} onOpenChange={setReasoningOpen}>
                    <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors w-full">
                        <Brain className="h-3.5 w-3.5" />
                        <span>AI Reasoning</span>
                        {reasoningOpen ? (
                            <ChevronUp className="h-3.5 w-3.5 ml-auto" />
                        ) : (
                            <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                        )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 whitespace-pre-wrap">
                            {aiReasoning}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}

            {/* Empty State */}
            {!hasEvidence && !aiReasoning && !hasRiskFlags && !hasActions && (
                <div className="text-sm text-muted-foreground italic">
                    No additional evidence or analysis available for this signal.
                </div>
            )}
        </div>
    );
}
