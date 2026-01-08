import { getAnalyzedSignalsWithDetails, getAnalyzedSignalStats } from "@/lib/db/analyzed-signals";
import { SignalsTable } from "@/components/signals/signals-table";
import { SignalFilters } from "@/components/signals/signal-filters";
import type { Priority } from "@/types/database";

interface PageProps {
    searchParams: Promise<{
        priority?: string;
        type?: string;
        geo?: string;
        sort?: string;
    }>;
}

export default async function SignalsPage({ searchParams }: PageProps) {
    const params = await searchParams;

    // Get stats for display
    const stats = await getAnalyzedSignalStats();

    // Get signals with details (joined with base signal)
    const priority = params.priority && params.priority !== "all"
        ? params.priority as Priority
        : undefined;

    const signalsWithDetails = await getAnalyzedSignalsWithDetails(priority, 100);

    // Transform to flat structure for table
    const signals = signalsWithDetails.map(item => ({
        id: item.id,
        signal_id: item.signal_id,
        entity_name: item.signal?.entity_name || "Unknown",
        entity_type: item.signal?.entity_type || "unknown",
        geo: item.signal?.geo || "N/A",
        signal_type: item.signal?.signal_type || "unknown",
        final_score: item.final_score,
        preliminary_score: null,
        priority: item.priority,
        analyzed_at: item.analyzed_at,
        collected_at: item.analyzed_at, // Use analyzed_at as fallback
    }));

    // Apply client-side sorting if needed
    const sortedSignals = [...signals];
    if (params.sort) {
        switch (params.sort) {
            case "score":
                sortedSignals.sort((a, b) =>
                    (b.final_score ?? 0) - (a.final_score ?? 0)
                );
                break;
            case "date":
                sortedSignals.sort((a, b) =>
                    new Date(b.analyzed_at).getTime() - new Date(a.analyzed_at).getTime()
                );
                break;
            case "name":
                sortedSignals.sort((a, b) =>
                    a.entity_name.localeCompare(b.entity_name)
                );
                break;
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Signals</h2>
                <p className="text-muted-foreground">
                    Browse and manage analyzed market signals
                </p>
            </div>

            <SignalFilters stats={stats} />

            <div className="rounded-md border">
                <SignalsTable signals={sortedSignals} />
            </div>

            <p className="text-sm text-muted-foreground">
                Showing {sortedSignals.length} of {stats.total} signals
            </p>
        </div>
    );
}
