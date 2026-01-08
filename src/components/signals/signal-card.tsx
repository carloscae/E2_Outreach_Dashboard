/**
 * Signal Card Component
 * Displays a signal with priority, score, and evidence
 */

"use client";

import { MapPin, Clock, Building2, Newspaper, Smartphone, Radio } from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "./priority-badge";
import { FeedbackButtons } from "./feedback-buttons";
import type { DashboardSignal } from "@/types/database";

interface SignalCardProps {
    signal: DashboardSignal;
}

const GEO_LABELS: Record<string, string> = {
    br: "BR",
    mx: "MX",
    ar: "AR",
    co: "CO",
    pe: "PE",
    cl: "CL",
    us: "US",
    eu: "EU",
};

const ENTITY_ICONS: Record<string, React.ReactNode> = {
    bookmaker: <Building2 className="h-3.5 w-3.5" />,
    publisher: <Newspaper className="h-3.5 w-3.5" />,
    app: <Smartphone className="h-3.5 w-3.5" />,
    channel: <Radio className="h-3.5 w-3.5" />,
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

export function SignalCard({ signal }: SignalCardProps) {
    const geoLabel = GEO_LABELS[signal.geo.toLowerCase()] || signal.geo.toUpperCase();
    const score = signal.final_score ?? signal.preliminary_score;
    const entityIcon = ENTITY_ICONS[signal.entity_type.toLowerCase()] || <Building2 className="h-3.5 w-3.5" />;

    return (
        <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <CardTitle className="text-lg font-semibold">
                            {signal.entity_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary" className="text-xs gap-1">
                                {entityIcon}
                                {signal.entity_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs gap-1">
                                <MapPin className="h-3 w-3" />
                                {geoLabel}
                            </Badge>
                        </CardDescription>
                    </div>
                    <CardAction className="flex flex-col items-end gap-2">
                        <PriorityBadge priority={signal.priority} />
                        <div className="text-right">
                            <span className="text-2xl font-bold tabular-nums">
                                {score ?? "-"}
                            </span>
                            <span className="text-sm text-muted-foreground">/14</span>
                        </div>
                    </CardAction>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(signal.collected_at)}</span>
                        <span className="text-border">•</span>
                        <span className="text-xs">{signal.signal_type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {signal.feedback_count > 0 && (
                            <span className="text-xs">
                                {signal.feedback_count} feedback
                            </span>
                        )}
                        <FeedbackButtons signalId={signal.id} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Skeleton loader for signal cards
 */
export function SignalCardSkeleton() {
    return (
        <Card className="animate-pulse">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-5 w-40 rounded bg-muted" />
                        <div className="flex gap-2">
                            <div className="h-5 w-20 rounded bg-muted" />
                            <div className="h-5 w-12 rounded bg-muted" />
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="h-5 w-16 rounded-full bg-muted" />
                        <div className="h-8 w-12 rounded bg-muted" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-4 w-48 rounded bg-muted" />
            </CardContent>
        </Card>
    );
}
