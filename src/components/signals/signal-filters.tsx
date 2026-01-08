/**
 * Signal Filters Component
 * Filter by priority, entity type, geo, and sort order
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Globe, ArrowDownWideNarrow, Calendar, Type } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SignalFiltersProps {
    className?: string;
    stats?: {
        total: number;
        by_priority: Record<string, number>;
    };
}

const PRIORITY_OPTIONS = [
    { value: "all", label: "All" },
    { value: "HIGH", label: "High" },
    { value: "MEDIUM", label: "Medium" },
    { value: "LOW", label: "Low" },
];

const ENTITY_TYPES = [
    { value: "all", label: "All Types" },
    { value: "bookmaker", label: "Bookmaker" },
    { value: "publisher", label: "Publisher" },
    { value: "app", label: "App" },
    { value: "channel", label: "Channel" },
];

const GEO_OPTIONS = [
    { value: "all", label: "All Regions" },
    { value: "br", label: "Brazil" },
    { value: "mx", label: "Mexico" },
    { value: "ar", label: "Argentina" },
];

const SORT_OPTIONS = [
    { value: "score", label: "Score", icon: <ArrowDownWideNarrow className="h-3.5 w-3.5 mr-1.5" /> },
    { value: "date", label: "Date", icon: <Calendar className="h-3.5 w-3.5 mr-1.5" /> },
    { value: "name", label: "Name", icon: <Type className="h-3.5 w-3.5 mr-1.5" /> },
];

export function SignalFilters({ className }: SignalFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentPriority = searchParams.get("priority") || "all";
    const currentType = searchParams.get("type") || "all";
    const currentGeo = searchParams.get("geo") || "all";
    const currentSort = searchParams.get("sort") || "score";

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all" || value === "score") {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`/dashboard/signals?${params.toString()}`);
    }, [router, searchParams]);

    return (
        <div className={className}>
            {/* Priority Tabs + Dropdowns in same row */}
            <div className="flex items-center justify-between gap-4">
                {/* Priority Tabs */}
                <Tabs
                    value={currentPriority}
                    onValueChange={(v) => updateParam("priority", v)}
                >
                    <TabsList>
                        {PRIORITY_OPTIONS.map((opt) => (
                            <TabsTrigger
                                key={opt.value}
                                value={opt.value}
                            >
                                {opt.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {/* Dropdowns */}
                <div className="flex flex-wrap gap-3">
                    {/* Entity Type */}
                    <Select
                        value={currentType}
                        onValueChange={(v) => updateParam("type", v)}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Entity Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {ENTITY_TYPES.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Geo */}
                    <Select
                        value={currentGeo}
                        onValueChange={(v) => updateParam("geo", v)}
                    >
                        <SelectTrigger className="w-[140px]">
                            <div className="flex items-center gap-1.5">
                                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Region" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {GEO_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select
                        value={currentSort}
                        onValueChange={(v) => updateParam("sort", v)}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    <span className="flex items-center">
                                        {opt.icon}
                                        {opt.label}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
