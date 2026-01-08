import { supabase } from "@/lib/db/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Mail } from "lucide-react";

export default async function ReportsPage() {
    const { data: reports, error } = await supabase
        .from("reports")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching reports:", error);
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
                <p className="text-muted-foreground">
                    View and manage sent intelligence reports
                </p>
            </div>

            {reports && reports.length > 0 ? (
                <div className="grid gap-4">
                    {reports.map((report) => (
                        <Card key={report.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Market Intelligence Report
                                    </CardTitle>
                                    <Badge variant="secondary">
                                        {report.summary_stats?.totalSignals || 0} signals
                                    </Badge>
                                </div>
                                <CardDescription className="flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        Report Generated
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {report.sent_at
                                            ? new Date(report.sent_at).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : new Date(report.created_at).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })
                                        }
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {report.content_html
                                        ? "HTML report sent successfully"
                                        : "Report content available"
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No reports yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Reports will appear here once generated and sent.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
