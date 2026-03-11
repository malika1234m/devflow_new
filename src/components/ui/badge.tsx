import { cn } from "@/lib/utils";

type BadgeVariant = "gray" | "blue" | "yellow" | "green" | "red" | "purple" | "indigo";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Helpers for specific domain badges
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    TODO: "gray",
    IN_PROGRESS: "blue",
    IN_REVIEW: "yellow",
    DONE: "green",
  };
  return <Badge variant={map[status] ?? "gray"}>{status.replace(/_/g, " ")}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, BadgeVariant> = {
    LOW: "gray",
    MEDIUM: "yellow",
    HIGH: "red",
    URGENT: "red",
  };
  return <Badge variant={map[priority] ?? "gray"}>{priority}</Badge>;
}

export function PlanBadge({ plan }: { plan: string }) {
  return <Badge variant={plan === "PRO" ? "indigo" : "gray"}>{plan}</Badge>;
}
