"use client";

import {
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
} from "stream-chat-react";
import { useEffect, useState } from "react";
import { StreamChat, Channel as StreamChannel } from "stream-chat";

// Initialize Stream Chat client with your API key
const chatClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!
);

interface ChatComponentProps {
  currentUserId: string;
  currentUserName: string;
  sellerId: string;
}

export default function ChatComponent({
  currentUserId,
  currentUserName,
  sellerId,
}: ChatComponentProps) {
  const [channel, setChannel] = useState<StreamChannel | null>(null);

  useEffect(() => {
    let activeChannel: StreamChannel | null = null;

    const init = async () => {
      try {
        // Connect user if not already connected
        if (!chatClient.userID) {
          const res = await fetch("/api/streamChat/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: currentUserId }),
          });

          const { token } = await res.json();
          if (!token) {
            console.error("Token generation failed.");
            return;
          }

          // Connect the user to Stream
          await chatClient.connectUser(
            { id: currentUserId, name: currentUserName },
            token
          );
        }

        // Create a channel for the current user and the seller
        activeChannel = chatClient.channel("messaging", undefined, {
          members: [currentUserId, sellerId],
        });

        // Watch the channel to receive messages
        await activeChannel.watch();
        setChannel(activeChannel);
      } catch (err) {
        console.error("Error setting up chat channel:", err);
      }
    };

    init();

    return () => {
      if (activeChannel) activeChannel.stopWatching();
    };
  }, [currentUserId, currentUserName, sellerId]);

  // Display loading while the channel is being set up
  if (!channel) return <div>Loading chat...</div>;

  return (
    <Channel channel={channel}>
      <Window>
        <ChannelHeader />
        <MessageList />
        <MessageInput />
      </Window>
    </Channel>
  );
}
