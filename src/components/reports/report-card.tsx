'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, MailCheck, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Report } from '@/types/database';

interface ReportCardProps {
    report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCycleDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Get summary stats from the report
    const stats = report.summary_stats || { highPriority: 0, mediumPriority: 0, lowPriority: 0 };

    // Parse markdown content for display
    const contentPreview = report.content_markdown?.substring(0, 500) || 'No content';


    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            Report: {formatCycleDate(report.cycle_start)} – {formatCycleDate(report.cycle_end)}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Created {formatDate(report.created_at)}
                            </span>
                            {report.sent_at ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    <MailCheck className="h-3 w-3 mr-1" />
                                    Sent {formatDate(report.sent_at)}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                    <Mail className="h-3 w-3 mr-1" />
                                    Not Sent
                                </Badge>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-red-500">{stats.highPriority || 0}</div>
                        <div className="text-xs text-muted-foreground">High Priority</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-yellow-500">{stats.mediumPriority || 0}</div>
                        <div className="text-xs text-muted-foreground">Medium</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-muted-foreground">{stats.lowPriority || 0}</div>
                        <div className="text-xs text-muted-foreground">Low</div>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="mt-4 pt-4 border-t">
                        {/* Markdown Content */}
                        <div>
                            <h4 className="font-semibold mb-2">📄 Report Content</h4>
                            <pre className="text-sm bg-muted/30 p-3 rounded overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                                {contentPreview}
                            </pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
