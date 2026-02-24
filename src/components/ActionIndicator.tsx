import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isTerminalStatus } from "@/lib/quote-status-config";

interface ActionIndicatorProps {
  message: string;
  actionRequired: boolean;
  status: string;
  variant?: "inline" | "banner";
}

export function ActionIndicator({
  message,
  actionRequired,
  status,
  variant = "inline",
}: ActionIndicatorProps) {
  const terminal = isTerminalStatus(status);

  if (variant === "inline") {
    if (terminal) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{message}</span>
        </span>
      );
    }

    if (actionRequired) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="truncate">{message}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3 shrink-0" />
        <span className="truncate">{message}</span>
      </span>
    );
  }

  // variant === "banner"
  if (terminal) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-gray-400" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }

  if (actionRequired) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-orange-600" />
        <p className="text-sm font-medium text-orange-800">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
      <Clock className="h-5 w-5 shrink-0 text-blue-500" />
      <p className="text-sm text-blue-700">{message}</p>
    </div>
  );
}
