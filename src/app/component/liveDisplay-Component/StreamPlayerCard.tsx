// components/StreamPlayerCard.tsx
import { Card } from "@/components/ui/card";
import StreamPlayer from "@/app/component/livePage/StreamPlayer";

interface StreamPlayerCardProps {
  playbackId: string;
  isLive: boolean;
}

export default function StreamPlayerCard({
  playbackId,
  isLive,
}: StreamPlayerCardProps) {
  return (
    <Card className="border-none shadow-xl overflow-hidden bg-black">
      <StreamPlayer playbackId={playbackId} isLive={isLive} />
    </Card>
  );
}
