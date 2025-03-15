"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Activity,
  CheckCircle2,
  Clock,
  Film,
  Key,
  Lock,
  Play,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type LiveStreamData = {
  id: string;
  stream_key: string;
  status: string;
  srt_passphrase: string;
  reconnect_window: number;
  recent_asset_ids: string[] | null;
  playback_ids:
    | {
        id: string;
        policy: string;
        max_continuous_duration: number;
        latency_mode: string;
        created_at: string;
        active_ingest_protocol: string;
        active_asset_id: string;
      }[]
    | null;
};

export default function LiveStreams() {
  const { id } = useParams();
  const [liveStreams, setLiveStreams] = useState<LiveStreamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        const response = await fetch("/api/mux");
        const data = await response.json();
        if (response.ok) {
          setLiveStreams(data.liveStreams || []);
        } else {
          setError("Failed to fetch live streams.");
        }
      } catch (error) {
        console.error(error);
        setError("Error fetching live streams.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStreams();
  }, []);

  const handleCompareStream = (liveStreamId: string) => {
    if (id === liveStreamId) {
      toast.success("Live Stream IDs match!");
    } else {
      toast.error("Live Stream IDs do not match.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
        <div className="w-12 h-12 relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
        </div>
        <p className="mt-4 text-muted-foreground">Loading live streams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-3xl mx-auto my-8 border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center p-6">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-destructive">{error}</h3>
            <p className="text-muted-foreground mt-2">
              There was a problem fetching your live streams. Please try again
              later.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (liveStreams.length === 0) {
    return (
      <Card className="max-w-3xl mx-auto my-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center p-6">
            <Film className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Live Streams Found</h3>
            <p className="text-muted-foreground mt-2">
              You don't have any live streams configured yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Live Streams</h1>
        <p className="text-muted-foreground mt-2">
          Manage and monitor your active streaming channels
        </p>
      </div>

      <div className="grid gap-6">
        {liveStreams.map((stream) => (
          <StreamCard
            key={stream.id}
            stream={stream}
            currentId={id as string}
            onCompare={handleCompareStream}
          />
        ))}
      </div>
    </div>
  );
}

function StreamCard({
  stream,
  currentId,
  onCompare,
}: {
  stream: LiveStreamData;
  currentId?: string;
  onCompare: (id: string) => void;
}) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={stream.status} />
            <CardTitle className="text-xl">{stream.stream_key}</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCompare(stream.id)}
            className={cn(
              "transition-colors",
              currentId === stream.id && "border-green-500 text-green-500"
            )}
          >
            {currentId === stream.id ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                ID Match
              </>
            ) : (
              "Compare ID"
            )}
          </Button>
        </div>
        <CardDescription className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
          <div className="flex items-center text-sm">
            <Key className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              {stream.id}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
            SRT Passphrase: {stream.srt_passphrase}
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            Reconnect Window: {stream.reconnect_window}s
          </div>
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="playback" className="px-6">
        <TabsList className="mb-4">
          <TabsTrigger value="playback">Playback</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="playback" className="space-y-4">
          {stream.playback_ids && stream.playback_ids.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {stream.playback_ids.map((playback, index) => (
                <Card key={index} className="bg-muted/40">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Playback ID</h4>
                      <Badge variant="outline" className="font-mono text-xs">
                        {playback.id}
                      </Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center">
                        <Shield className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Policy:</span>
                      </div>
                      <span className="font-medium">{playback.policy}</span>

                      <div className="flex items-center">
                        <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Max Duration:
                        </span>
                      </div>
                      <span className="font-medium">
                        {playback.max_continuous_duration}s
                      </span>

                      <div className="flex items-center">
                        <Activity className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Latency:</span>
                      </div>
                      <span className="font-medium">
                        {playback.latency_mode}
                      </span>

                      <div className="flex items-center">
                        <RefreshCw className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Protocol:</span>
                      </div>
                      <span className="font-medium">
                        {playback.active_ingest_protocol}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Created: {formatDate(playback.created_at)}
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 gap-1">
                          <Play className="h-3.5 w-3.5" />
                          <span className="text-xs">Play</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No playback data available
            </div>
          )}
        </TabsContent>

        <TabsContent value="assets">
          <Card className="bg-muted/40">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Recent Asset IDs</h4>
              {stream.recent_asset_ids && stream.recent_asset_ids.length > 0 ? (
                <div className="grid gap-2">
                  {stream.recent_asset_ids.map((assetId, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-background rounded-md"
                    >
                      <span className="font-mono text-xs">{assetId}</span>
                      <Button variant="ghost" size="sm" className="h-7">
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent assets
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-end gap-2 p-6 pt-4">
        <Button variant="outline" size="sm">
          Edit Stream
        </Button>
        <Button size="sm" className="gap-1">
          <Play className="h-4 w-4" />
          View Stream
        </Button>
      </CardFooter>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let icon = null;

  switch (status.toLowerCase()) {
    case "active":
      variant = "default";
      icon = <Activity className="h-3 w-3 mr-1" />;
      break;
    case "idle":
      variant = "secondary";
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case "disabled":
      variant = "destructive";
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
  }

  return (
    <Badge variant={variant} className="h-6 gap-1">
      {icon}
      {status}
    </Badge>
  );
}

function formatDate(timestamp: string): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
