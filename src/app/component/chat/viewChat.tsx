"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { Channel, MessageList, MessageInput, Window } from "stream-chat-react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!;

export default function ViewerChat({ streamerId }: { streamerId: string }) {
  const { user } = useUser();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      const tokenRes = await fetch(`/api/streamChat/token?userId=${user.id}`);
      const { token } = await tokenRes.json();

      const client = StreamChat.getInstance(apiKey);
      await client.connectUser(
        { id: user.id, name: user.fullName || "Viewer" },
        token
      );

      const privateChannel = client.channel(
        "messaging",
        `stream-${streamerId}-${user.id}`,
        {
          members: [user.id, streamerId],
        }
      );

      await privateChannel.watch();
      setChatClient(client);
      setChannel(privateChannel);
    };

    init();
    return () => {
      chatClient?.disconnectUser();
    };
  }, [user]);

  if (!channel) return <div>Loading chat...</div>;

  return (
    <Channel channel={channel}>
      <Window>
        <MessageList />
        <MessageInput />
      </Window>
    </Channel>
  );
}
