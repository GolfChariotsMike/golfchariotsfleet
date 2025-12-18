import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type TrikeStatus = Database["public"]["Enums"]["trike_status"];
type IssueStatus = Database["public"]["Enums"]["issue_status"];
type IssueSeverity = Database["public"]["Enums"]["issue_severity"];

interface StatusBadgeProps {
  status: TrikeStatus | IssueStatus;
  className?: string;
}

const trikeStatusConfig: Record<TrikeStatus, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "status-available",
  },
  in_repair: {
    label: "In Repair",
    className: "status-in-repair",
  },
  out_of_service: {
    label: "Out of Service",
    className: "status-out-of-service",
  },
};

const issueStatusConfig: Record<IssueStatus, { label: string; className: string }> = {
  reported: {
    label: "Reported",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  acknowledged: {
    label: "Acknowledged",
    className: "status-in-repair",
  },
  in_repair: {
    label: "In Repair",
    className: "status-in-repair",
  },
  resolved: {
    label: "Resolved",
    className: "status-available",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = trikeStatusConfig[status as TrikeStatus] || issueStatusConfig[status as IssueStatus];

  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface SeverityBadgeProps {
  severity: IssueSeverity;
  className?: string;
}

const severityConfig: Record<IssueSeverity, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  high: {
    label: "High",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
