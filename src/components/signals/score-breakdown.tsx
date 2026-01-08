/**
 * Score Breakdown Component
 * Displays the 4-component score breakdown with visual progress bars
 */

"use client";

import { TrendingUp, Handshake, Target, Shield } from "lucide-react";
import type { ScoreBreakdown as ScoreBreakdownType } from "@/types/database";

interface ScoreBreakdownProps {
    breakdown: ScoreBreakdownType | null;
    className?: string;
}

const SCORE_COMPONENTS = [
    {
        key: "marketEntryMomentum" as const,
        label: "Market Entry Momentum",
        max: 4,
        icon: TrendingUp,
        description: "Evidence of market expansion signals",
    },
    {
        key: "e2PartnershipFit" as const,
        label: "E2 Partnership Fit",
        max: 4,
        icon: Handshake,
        description: "Alignment with E2's offering",
    },
    {
        key: "actionability" as const,
        label: "Actionability",
        max: 3,
        icon: Target,
        description: "Ability to take immediate action",
    },
    {
        key: "dataConfidence" as const,
        label: "Data Confidence",
        max: 3,
        icon: Shield,
        description: "Quality of underlying data",
    },
];

function getScoreColor(value: number, max: number): string {
    const percentage = value / max;
    if (percentage >= 0.75) return "bg-green-500";
    if (percentage >= 0.5) return "bg-yellow-500";
    if (percentage >= 0.25) return "bg-orange-500";
    return "bg-red-500";
}

export function ScoreBreakdown({ breakdown, className = "" }: ScoreBreakdownProps) {
    if (!breakdown) {
        return (
            <div className={`text-sm text-muted-foreground ${className}`}>
                Score breakdown not available
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <h4 className="text-sm font-medium text-foreground">Score Breakdown</h4>
            <div className="space-y-2">
                {SCORE_COMPONENTS.map((component) => {
                    const value = breakdown[component.key] ?? 0;
                    const percentage = (value / component.max) * 100;
                    const Icon = component.icon;

                    return (
                        <div key={component.key} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Icon className="h-3 w-3" />
                                    <span>{component.label}</span>
                                </div>
                                <span className="font-mono font-medium">
                                    {value}/{component.max}
                                </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${getScoreColor(value, component.max)}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
