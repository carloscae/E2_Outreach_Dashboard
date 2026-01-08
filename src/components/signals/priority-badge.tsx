/**
 * Priority Badge Component
 * Displays HIGH/MEDIUM/LOW priority with appropriate colors
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Priority } from "@/types/database";

interface PriorityBadgeProps {
    priority: Priority | null;
    className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
    const priorityStyles = {
        HIGH: "bg-red-500/15 text-red-500 border-red-500/30",
        MEDIUM: "bg-amber-500/15 text-amber-500 border-amber-500/30",
        LOW: "bg-muted text-muted-foreground border-border",
    };

    const displayPriority = priority || "PENDING";
    const style = priority ? priorityStyles[priority] : "bg-muted text-muted-foreground border-border";

    return (
        <Badge variant="outline" className={cn(style, className)}>
            {displayPriority}
        </Badge>
    );
}
