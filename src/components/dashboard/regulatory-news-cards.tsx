'use client';

/**
 * Regulatory News Cards
 * Displays pending regulatory news items requiring user action (Apply/Ignore)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';

interface RegulatoryNews {
    id: string;
    headline: string;
    headline_en?: string;
    url: string;
    source: string;
    publishedAt: string;
    status: 'pending' | 'applied' | 'ignored';
}

export function RegulatoryNewsCards() {
    const [news, setNews] = useState<RegulatoryNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchNews = async () => {
        try {
            const res = await fetch('/api/regulatory-news');
            const data = await res.json();
            if (data.success) {
                setNews(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch regulatory news:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleAction = async (id: string, action: 'apply' | 'ignore') => {
        setUpdating(id);
        try {
            const res = await fetch('/api/regulatory-news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action }),
            });
            const data = await res.json();
            if (data.success) {
                // Remove from list
                setNews(prev => prev.filter(n => n.id !== id));
            }
        } catch (err) {
            console.error('Failed to update news:', err);
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading regulatory updates...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (news.length === 0) {
        return null; // Don't show if no pending news
    }

    return (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Regulatory Updates Requiring Review
                    <Badge variant="secondary" className="ml-auto">
                        {news.length} pending
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {news.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-background border"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-snug">
                                {item.headline_en || item.headline}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{item.source}</span>
                                <span>•</span>
                                <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    Read <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                onClick={() => handleAction(item.id, 'ignore')}
                                disabled={updating === item.id}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 px-2 bg-green-600 hover:bg-green-700"
                                onClick={() => handleAction(item.id, 'apply')}
                                disabled={updating === item.id}
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                <p className="text-xs text-muted-foreground italic">
                    ✅ Apply to update market context • ❌ Ignore to dismiss
                </p>
            </CardContent>
        </Card>
    );
}
