/**
 * Feedback Buttons Component
 * Thumbs up/down buttons for signal feedback
 */

"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeedbackButtonsProps {
    signalId: string;
    initialFeedback?: boolean | null;
    className?: string;
}

export function FeedbackButtons({
    signalId,
    initialFeedback = null,
    className,
}: FeedbackButtonsProps) {
    const [feedback, setFeedback] = useState<boolean | null>(initialFeedback);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFeedback = async (isUseful: boolean) => {
        // Toggle off if same button clicked
        if (feedback === isUseful) {
            setFeedback(null);
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    signalId,
                    isUseful,
                }),
            });

            if (!res.ok) throw new Error("Failed to submit feedback");

            setFeedback(isUseful);
        } catch (err) {
            console.error("Feedback error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {/* Thumbs Up */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(true)}
                disabled={isSubmitting}
                className={cn(
                    "h-8 w-8 p-0 transition-all",
                    feedback === true
                        ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                        : "text-muted-foreground hover:text-foreground"
                )}
                title="Useful signal"
            >
                <ThumbsUp className="h-4 w-4" />
            </Button>

            {/* Thumbs Down */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(false)}
                disabled={isSubmitting}
                className={cn(
                    "h-8 w-8 p-0 transition-all",
                    feedback === false
                        ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                        : "text-muted-foreground hover:text-foreground"
                )}
                title="Not useful"
            >
                <ThumbsDown className="h-4 w-4" />
            </Button>
        </div>
    );
}
