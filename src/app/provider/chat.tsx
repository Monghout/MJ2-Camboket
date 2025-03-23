// src/app/provider/chat.tsx
"use client";

import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import { useEffect, useState } from "react";
import "stream-chat-react/dist/css/v2/index.css"; // For new UI v2

type ChatProviderProps = {
  children: React.ReactNode;
  apiKey: string;
  userId: string;
  userName: string;
  userToken: string;
};

export function StreamChatProvider({
  children,
  apiKey,
  userId,
  userName,
  userToken,
}: ChatProviderProps) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    const client = StreamChat.getInstance(apiKey);

    const connect = async () => {
      try {
        await client.connectUser(
          {
            id: userId,
            name: userName,
          },
          userToken
        );
        setChatClient(client);
      } catch (error) {
        console.error("Failed to connect user to chat client:", error);
      }
    };

    connect();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [apiKey, userId, userName, userToken]);

  if (!chatClient) return <div>Loading chat...</div>; // Show loading state if chat client is not available

  return <Chat client={chatClient}>{children}</Chat>;
}
