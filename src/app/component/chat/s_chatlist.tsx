"use client";
import { useEffect, useState } from "react";
import { useChatSelection } from "@/app/provider/chat";

export default function StreamerChatList({
  chatClient,
  streamerId,
}: {
  chatClient: any;
  streamerId: string;
}) {
  const { setSelectedChannel } = useChatSelection();
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {
    const loadChannels = async () => {
      const res = await chatClient.queryChannels({
        type: "messaging",
        members: { $in: [streamerId] },
      });

      setChannels(res);
    };

    if (chatClient) loadChannels();
  }, [chatClient]);

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-lg font-bold">Viewer Chats</h2>
      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => setSelectedChannel(channel)}
          className="w-full text-left bg-gray-700 text-white p-2 rounded hover:bg-gray-600"
        >
          {channel.data?.name ||
            channel.state.members.find((m: any) => m.user_id !== streamerId)
              ?.user?.name ||
            "Viewer"}
        </button>
      ))}
    </div>
  );
}
