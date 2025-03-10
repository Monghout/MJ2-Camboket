import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  isLive: boolean;
  isOnline: boolean;
}

export default function StatusBadge({ isLive, isOnline }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Stream Status (Live/Offline) */}
      <Badge
        variant={isLive ? "default" : "outline"}
        className={isLive ? "bg-red-500 hover:bg-red-600" : ""}
      >
        {isLive ? "LIVE" : "OFFLINE"}
      </Badge>

      {/* Seller Online Status */}
      <div className="flex items-center gap-1">
        <div
          className={`h-2 w-2 rounded-full ${
            isOnline ? "bg-green-500" : "bg-gray-500"
          }`}
        />
        <span className="text-sm text-muted-foreground">
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
}
