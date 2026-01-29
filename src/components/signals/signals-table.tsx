"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Radio, Clock, Archive, Building2, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const ENTITY_TYPE_ICONS: Record<string, React.ReactNode> = {
    bookmaker: <Building2 className="h-3.5 w-3.5" />,
    publisher: <Newspaper className="h-3.5 w-3.5" />,
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
    showArchived?: boolean;
}

type EntityFilter = "all" | "bookmaker" | "publisher";

export function SignalsTable({ signals, showArchived = false }: SignalsTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [entityFilter, setEntityFilter] = useState<EntityFilter>("all");

    const filteredSignals = useMemo(() => {
        let result = signals;

        // Filter by entity type
        if (entityFilter !== "all") {
            result = result.filter(s => s.entity_type === entityFilter);
        }

        // Show/hide archived based on prop
        if (!showArchived) {
            result = result.filter(s => !s.is_archived && !s.is_expired);
        }

        return result;
    }, [signals, entityFilter, showArchived]);

    const counts = useMemo(() => ({
        all: signals.filter(s => showArchived || (!s.is_archived && !s.is_expired)).length,
        bookmaker: signals.filter(s => s.entity_type === 'bookmaker' && (showArchived || (!s.is_archived && !s.is_expired))).length,
        publisher: signals.filter(s => s.entity_type === 'publisher' && (showArchived || (!s.is_archived && !s.is_expired))).length,
    }), [signals, showArchived]);

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

    const getExpirationBadge = (signal: DashboardSignal) => {
        if (signal.is_archived) {
            return (
                <Badge variant="secondary" className="gap-1 text-xs">
                    <Archive className="h-3 w-3" />
                    Archived
                </Badge>
            );
        }
        if (signal.is_expired) {
            return (
                <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Expired
                </Badge>
            );
        }
        if (signal.signal_category === 'time_sensitive' && signal.expires_at) {
            const daysLeft = Math.ceil(
                (new Date(signal.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            if (daysLeft <= 3) {
                return (
                    <Badge variant="warning" className="gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {daysLeft}d left
                    </Badge>
                );
            }
        }
        return null;
    };

    if (filteredSignals.length === 0 && signals.length === 0) {
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
        <div className="space-y-4">
            {/* Entity Type Filter Tabs */}
            <div className="px-4">
                <Tabs value={entityFilter} onValueChange={(v) => setEntityFilter(v as EntityFilter)}>
                    <TabsList>
                        <TabsTrigger value="all" className="gap-2">
                            All
                            <Badge variant="secondary" className="text-xs px-1.5">{counts.all}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="bookmaker" className="gap-2">
                            <Building2 className="h-4 w-4" />
                            Bookmakers
                            <Badge variant="secondary" className="text-xs px-1.5">{counts.bookmaker}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="publisher" className="gap-2">
                            <Newspaper className="h-4 w-4" />
                            Publishers
                            <Badge variant="secondary" className="text-xs px-1.5">{counts.publisher}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {filteredSignals.length === 0 ? (
                <div className="py-12 px-4">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Radio className="h-10 w-10 text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyTitle>No {entityFilter} signals</EmptyTitle>
                            <EmptyDescription>
                                {entityFilter === 'publisher'
                                    ? 'Run the publisher collector to discover opportunities.'
                                    : 'Try a different filter or run the collector again.'}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            ) : (
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
                        {filteredSignals.map((signal) => {
                            const priorityVariant = PRIORITY_VARIANTS[signal.priority || ""] || "outline";
                            const score = signal.final_score ?? signal.preliminary_score ?? 0;
                            const date = new Date(signal.collected_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            });
                            const isExpanded = expandedRows.has(signal.id);
                            const hasDetails = signal.evidence?.length > 0 || signal.ai_reasoning || signal.score_breakdown;
                            const expirationBadge = getExpirationBadge(signal);

                            return (
                                <React.Fragment key={signal.id}>
                                    <TableRow
                                        className={`${hasDetails ? 'cursor-pointer hover:bg-muted/50' : ''} ${isExpanded ? 'bg-muted/30' : ''} ${signal.is_expired || signal.is_archived ? 'opacity-60' : ''}`}
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
                                            <div className="flex items-center gap-2">
                                                <span>{signal.entity_name}</span>
                                                {expirationBadge}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize gap-1">
                                                {ENTITY_TYPE_ICONS[signal.entity_type]}
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
            )}
        </div>
    );
}

