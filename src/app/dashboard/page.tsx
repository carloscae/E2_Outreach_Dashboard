import { getAnalyzedSignalsWithDetails } from "@/lib/db/analyzed-signals";
import { getAnalyzedSignalStats } from "@/lib/db/analyzed-signals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    AlertTriangle,
    AlertCircle,
    Minus,
    Radio,
    FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RegulatoryNewsCards } from "@/components/dashboard/regulatory-news-cards";

export default async function DashboardPage() {
    // Get stats
    const stats = await getAnalyzedSignalStats();

    // Get recent high-priority signals
    const highPrioritySignals = await getAnalyzedSignalsWithDetails("HIGH", 5);

    return (
        <div className="space-y-6">
            {/* Regulatory News Cards - requires user action */}
            <RegulatoryNewsCards />
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{stats.by_priority.HIGH}</div>
                        <p className="text-xs text-muted-foreground">
                            Requires immediate attention
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{stats.by_priority.MEDIUM}</div>
                        <p className="text-xs text-muted-foreground">
                            Worth monitoring
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Priority</CardTitle>
                        <Minus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.by_priority.LOW}</div>
                        <p className="text-xs text-muted-foreground">
                            For reference
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Radio className="h-5 w-5" />
                            Recent High-Priority Signals
                        </CardTitle>
                        <CardDescription>
                            Latest signals requiring attention
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {highPrioritySignals.length > 0 ? (
                            <div className="space-y-3">
                                {highPrioritySignals.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="destructive" className="text-xs">
                                                HIGH
                                            </Badge>
                                            <span className="font-medium">{item.signal?.entity_name || "Unknown"}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            Score: {item.final_score}/14
                                        </span>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full mt-2" asChild>
                                    <Link href="/dashboard/signals?priority=HIGH">
                                        View All High Priority
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No high-priority signals at this time.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>
                            Common tasks and workflows
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/dashboard/signals">
                                <Radio className="mr-2 h-4 w-4" />
                                Browse All Signals
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/dashboard/reports">
                                <FileText className="mr-2 h-4 w-4" />
                                View Reports
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Generate Report (Coming Soon)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
