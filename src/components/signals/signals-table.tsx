"use client";

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
import { Radio } from "lucide-react";
import { FeedbackButtons } from "./feedback-buttons";

interface TableSignal {
    id: string;
    signal_id?: string; // Base signal ID for feedback
    entity_name: string;
    entity_type: string;
    geo: string;
    signal_type: string;
    final_score: number | null;
    preliminary_score: number | null;
    priority: string | null;
    analyzed_at: string;
    collected_at: string;
}

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
    signals: TableSignal[];
}

export function SignalsTable({ signals }: SignalsTableProps) {
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
                        <TableHead className="pl-6">Entity</TableHead>
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
                        const date = new Date(signal.analyzed_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        });

                        return (
                            <TableRow key={signal.id}>
                                <TableCell className="font-medium pl-6">
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
                                <TableCell className="text-right pr-6">
                                    <FeedbackButtons signalId={signal.signal_id || signal.id} className="justify-end" />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
