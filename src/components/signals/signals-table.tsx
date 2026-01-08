"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@/components/ui/empty";
import { FeedbackButtons } from "./feedback-buttons";
import { ScoreBreakdown } from "./score-breakdown";
import { EvidencePanel } from "./evidence-panel";
import type { DashboardSignal } from "@/types/database";

const PRIORITY_VARIANTS: Record<string, "destructive" | "warning" | "outline"> = {
    HIGH: "destructive",
    MEDIUM: "warning",
    LOW: "outline",
};

const COUNTRY_NAMES: Record<string, string> = {
    br: "Brazil",
    mx: "Mexico",
    ar: "Argentina",
    us: "United States",
    gb: "United Kingdom",
    ca: "Canada",
    au: "Australia",
    de: "Germany",
    fr: "France",
    es: "Spain",
    it: "Italy",
    pt: "Portugal",
};

interface SignalsTableProps {
    signals: DashboardSignal[];
}

export function SignalsTable({ signals }: SignalsTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    if (signals.length === 0) {
        return (
            <div className="py-12 px-4">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Radio className="h-10 w-10 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>No matching signals</EmptyTitle>
                        <EmptyDescription>
                            Try adjusting your filters or wait for new signals to be analyzed.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        );
    }

    return (
        <div>
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-8 pl-4"></TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Signal Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right pr-6">Feedback</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {signals.map((signal) => {
                        const priorityVariant = PRIORITY_VARIANTS[signal.priority || ""] || "outline";
                        const score = signal.final_score ?? signal.preliminary_score ?? 0;
                        const date = new Date(signal.collected_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        });
                        const isExpanded = expandedRows.has(signal.id);
                        const hasDetails = signal.evidence?.length > 0 || signal.ai_reasoning || signal.score_breakdown;

                        return (
                            <React.Fragment key={signal.id}>
                                <TableRow
                                    className={`${hasDetails ? 'cursor-pointer hover:bg-muted/50' : ''} ${isExpanded ? 'bg-muted/30' : ''}`}
                                    onClick={() => hasDetails && toggleRow(signal.id)}
                                >
                                    <TableCell className="pl-4">
                                        {hasDetails && (
                                            <button
                                                className="p-1 rounded hover:bg-muted"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleRow(signal.id);
                                                }}
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </button>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <span>{signal.entity_name}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {signal.entity_type || "unknown"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {COUNTRY_NAMES[signal.geo?.toLowerCase()] || signal.geo || "N/A"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="font-mono text-sm">
                                            {score}<span className="text-muted-foreground">/14</span>
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={priorityVariant} className="capitalize">
                                            {(signal.priority || "low").toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {signal.signal_type || "market_presence"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">{date}</span>
                                    </TableCell>
                                    <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                                        <FeedbackButtons signalId={signal.id} className="justify-end" />
                                    </TableCell>
                                </TableRow>
                                {isExpanded && hasDetails && (
                                    <TableRow key={`${signal.id}-details`} className="bg-muted/20 hover:bg-muted/20">
                                        <TableCell colSpan={9} className="p-0">
                                            <div className="px-6 py-4 border-t border-border/50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <ScoreBreakdown breakdown={signal.score_breakdown} />
                                                    <EvidencePanel
                                                        evidence={signal.evidence || []}
                                                        sourceUrls={signal.source_urls}
                                                        aiReasoning={signal.ai_reasoning}
                                                        riskFlags={signal.risk_flags}
                                                        recommendedActions={signal.recommended_actions}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

