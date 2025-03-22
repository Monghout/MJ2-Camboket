"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { StreamChat } from "stream-chat";

interface StreamChatContextType {
  chatClient: StreamChat | null;
}

const StreamChatContext = createContext<StreamChatContextType>({
  chatClient: null,
});

export const useStreamChat = () => useContext(StreamChatContext);

interface StreamChatProviderProps {
  children: ReactNode;
}

export const StreamChatProvider: React.FC<StreamChatProviderProps> = ({
  children,
}) => {
  const [chatClient, setChatClient] = React.useState<StreamChat | null>(null);

  React.useEffect(() => {
    // Initialize Stream Chat client
    const client = new StreamChat("37a6hrs66ta2");
    setChatClient(client);

    // Cleanup function
    return () => {
      if (client) {
        client.disconnectUser().then(() => {
          console.log("User disconnected");
        });
      }
    };
  }, []);

  return (
    <StreamChatContext.Provider value={{ chatClient }}>
      {children}
    </StreamChatContext.Provider>
  );
};
