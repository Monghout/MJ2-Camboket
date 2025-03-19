// components/StreamChatProvider.tsx
"use client";

import React, { useEffect, useState } from "react";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

const apiKey = process.env.PUBLIC_STREAM_KEY; // Your Stream Chat API key

interface StreamChatProviderProps {
  user: {
    id: string;
    name: string;
    image?: string;
  };
  channelId: string;
  stream: {
    sellerId: string; // Add sellerId to the stream object
  };
}

export const StreamChatProvider: React.FC<StreamChatProviderProps> = ({
  user,
  channelId,
  stream,
}) => {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);

  useEffect(() => {
    const client = StreamChat.getInstance(apiKey!);

    const connectUser = async () => {
      try {
        await client.connectUser(
          {
            id: user.id,
            name: user.name,
            image: user.image,
          },
          client.devToken(user.id) // Use a proper authentication mechanism in production
        );

        // Create or get the channel
        const channel = client.channel("livestream", channelId, {
          name: "Live Stream Chat",
          created_by_id: user.id,
        });
        await channel.watch(); // Start watching the channel
        setChannel(channel);

        setChatClient(client);
      } catch (err) {
        console.error("Error connecting user to Stream Chat:", err);
      }
    };

    connectUser();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [user.id, user.name, user.image, channelId]);

  if (!chatClient || !channel) {
    return <div>Loading chat...</div>;
  }

  const isOwner = stream.sellerId === user.id; // Check if the logged-in user is the owner
  const isLoggedIn = !!user; // Check if the user is logged in

  return (
    <Chat client={chatClient}>
      <Channel channel={channel}>
        <Window>
          <MessageList />
          <MessageInput
            disabled={!isOwner || !isLoggedIn} // Disable input for non-owners and non-logged-in users
          />
        </Window>
      </Channel>
    </Chat>
  );
};
