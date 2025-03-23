"use client";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import { createContext, useContext, useEffect, useState } from "react";

type ChatContextType = {
  selectedChannel: any;
  setSelectedChannel: (channel: any) => void;
};

const ChatSelectionContext = createContext<ChatContextType | null>(null);
export const useChatSelection = () => useContext(ChatSelectionContext)!;

export function StreamChatProvider({
  children,
  apiKey,
  userId,
  userName,
  userToken,
}: {
  children: React.ReactNode;
  apiKey: string;
  userId: string;
  userName: string;
  userToken: string;
}) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);

  useEffect(() => {
    const client = StreamChat.getInstance(apiKey);
    const connect = async () => {
      await client.connectUser({ id: userId, name: userName }, userToken);
      setChatClient(client);
    };
    connect();
    return () => {
      chatClient?.disconnectUser();
    };
  }, [apiKey, userId, userName, userToken]);

  if (!chatClient) return <div>Loading chat...</div>;

  return (
    <ChatSelectionContext.Provider
      value={{ selectedChannel, setSelectedChannel }}
    >
      <Chat client={chatClient}>{children}</Chat>
    </ChatSelectionContext.Provider>
  );
}
