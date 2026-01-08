'use client';

import { useEffect, useState } from 'react';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { ReportCard } from '@/components/reports/report-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Report } from '@/types/database';

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReports = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/reports?limit=50');
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch reports');
            }

            setReports(data.data || []);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(String(err));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FileText className="h-8 w-8" />
                        Report Archive
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View generated intelligence reports and their delivery status
                    </p>
                </div>
                <Button onClick={fetchReports} variant="outline" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center items-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <Card className="border-destructive">
                    <CardContent className="flex items-center gap-4 py-6">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <div>
                            <h3 className="font-semibold">Failed to load reports</h3>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                        <Button onClick={fetchReports} variant="outline" className="ml-auto">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && reports.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            Reports are generated when the Reporter Agent analyzes collected signals.
                            Run the full pipeline to generate your first report.
                        </p>
                        <Button className="mt-4" asChild>
                            <a href="/test">Go to Test Page</a>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Reports List */}
            {!isLoading && !error && reports.length > 0 && (
                <div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Showing {reports.length} report{reports.length !== 1 ? 's' : ''}
                    </p>
                    {reports.map((report) => (
                        <ReportCard key={report.id} report={report} />
                    ))}
                </div>
            )}
        </div>
    );
}
