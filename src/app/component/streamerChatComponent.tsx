"use client";

import { useUser } from "@clerk/nextjs";
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/app/component/LoadingSpinner";
import { StreamChat, type Channel as StreamChannel } from "stream-chat";
import { MessageSquare, X, User, ChevronDown, ChevronUp } from "lucide-react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!;

interface Stream {
  _id: string;
  title: string;
  category: string;
  description: string;
  isLive: boolean;
  thumbnail?: string;
  sellerId: string;
  sellerName: string;
  products: any[];
}

interface StreamerChatComponentProps {
  streamerId: string;
  stream: Stream | null;
}

const StreamerChatOverlay = ({
  streamerId,
  stream,
}: StreamerChatComponentProps) => {
  const { user } = useUser();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    if (!user) return;

    const initializeChatClient = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/streamChat/token?userId=${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch token");
        }

        const { token } = await response.json();
        const client = StreamChat.getInstance(apiKey);

        await client.connectUser(
          {
            id: user.id,
            name: user.fullName || user.username || "Anonymous",
            image: user.imageUrl,
          },
          token
        );

        const filter = { type: "messaging", members: { $in: [streamerId] } };
        const sort = [{ last_message_at: -1 as const }];
        const channels = await client.queryChannels(filter, sort, {
          watch: true,
          state: true,
        });

        setChannels(channels);
        if (channels.length > 0) {
          setChannel(channels[0]);
        }

        setChatClient(client);
      } catch (error) {
        console.error("Error initializing Stream Chat client:", error);
        setError("Failed to initialize chat. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeChatClient();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [user, streamerId]);

  const removeChannel = async (channelId: string) => {
    const channelToRemove = channels.find((ch) => ch.id === channelId);
    if (channelToRemove) {
      try {
        await channelToRemove.stopWatching();
        await channelToRemove.hide();
      } catch (error) {
        console.error("Error archiving channel:", error);
      }
    }

    setChannels((prevChannels) =>
      prevChannels.filter((ch) => ch.id !== channelId)
    );

    if (channel?.id === channelId) {
      setChannel(null);
    }
  };

  const getOtherMember = (channel: StreamChannel) => {
    const members = Object.values(channel.state.members);
    const otherMember = members.find((member) => member.user_id !== streamerId);
    return {
      name: otherMember?.user?.name || "Anonymous",
      image: otherMember?.user?.image || null,
      id: otherMember?.user_id || "unknown",
    };
  };

  if (error) {
    return (
      <div className="text-white bg-red-500/20 p-4 rounded-md border border-red-500 animate-pulse">
        {error}
      </div>
    );
  }

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div
      className="fixed bottom-8 right-8 z-50 shadow-2xl rounded-t-lg overflow-hidden transition-all duration-500"
      style={{
        width: isMinimized ? "200px" : "800px",
        height: isMinimized ? "60px" : "700px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Header */}
      <div
        className="bg-black text-white p-4 flex justify-between items-center border-b rounded-lg border-white/20 cursor-pointer transition-all duration-500 border-2 hover:border-white"
        onClick={toggleMinimize}
      >
        <div className="flex items-center gap-3 truncate">
          <MessageSquare className="h-6 w-6 flex-shrink-0" />
          {!isMinimized && <span className="font-semibold text-xl">Chats</span>}
          {isMinimized && (
            <span className="font-semibold text-sm truncate">Chats</span>
          )}
        </div>
        <div className="flex items-center gap-3"></div>
      </div>

      {!isMinimized && (
        <div className="flex h-full bg-black text-white transition-all duration-500">
          {/* Channel List Section */}
          <div className="w-1/3 p-4 border-r border-white/10 bg-black overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-white p-2">
              Active Chats
            </h3>

            {isLoading ? (
              <div className="flex justify-center p-4">
                <LoadingSpinner size="medium" />
              </div>
            ) : channels.length === 0 ? (
              <div className="text-gray-400 text-sm italic p-2">
                No active chats
              </div>
            ) : (
              <div className="space-y-2">
                {channels.map((ch) => {
                  const otherMember = getOtherMember(ch);
                  return (
                    <div
                      key={ch.id}
                      className={`p-3 rounded-lg transition-all duration-500 cursor-pointer flex justify-between items-center ${
                        channel?.id === ch.id
                          ? "bg-white text-black"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <div
                        className="flex items-center gap-3 truncate flex-1"
                        onClick={() => setChannel(ch)}
                      >
                        {otherMember.image ? (
                          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
                            <img
                              src={otherMember.image || "/placeholder.svg"}
                              alt={otherMember.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20">
                            <User className="h-5 w-5 text-white/70" />
                          </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate font-medium">
                            {otherMember.name}
                          </span>
                          <span className="text-xs opacity-70 truncate">
                            ID: {otherMember.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                      <button
                        className="text-gray-400 hover:text-red-500 transition-all duration-500 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeChannel(ch.id!);
                        }}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            {chatClient ? (
              <Chat client={chatClient} theme="str-chat__theme-dark">
                {channel ? (
                  <Channel channel={channel}>
                    <Window hideOnThread>
                      <ChannelHeader />
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/70 p-6 text-center">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-light">
                      Select a chat to start messaging
                    </p>
                  </div>
                )}
              </Chat>
            ) : (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="medium" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom CSS to override Stream Chat styles for overlay */}
      <style jsx global>{`
        /* Animation for the chat button */
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        /* Override Stream Chat styles for overlay */
        .str-chat__container {
          height: 100% !important;
          max-height: none !important;
        }

        .str-chat__main-panel {
          height: calc(100% - 70px) !important;
        }

        .str-chat__message-list-scroll {
          padding: 1rem !important;
        }

        .str-chat__message-list {
          background: black !important;
        }

        .str-chat__message-input {
          background: #111 !important;
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 1rem !important;
        }

        .str-chat__message-input-inner {
          padding: 0 !important;
        }

        .str-chat__message-textarea textarea {
          background: transparent !important;
          min-height: 50px !important;
          max-height: 120px !important;
          font-size: 1rem !important;
          padding: 0.75rem !important;
        }

        .str-chat__channel-header {
          padding: 1rem !important;
          height: auto !important;
        }

        .str-chat__channel-header-title {
          font-size: 1rem !important;
        }

        .str-chat__message-simple {
          padding: 0.75rem !important;
          margin-bottom: 0.5rem !important;
          transition: all 0.5s ease !important;
        }

        .str-chat__message-simple:hover {
          transform: translateY(-2px) !important;
        }

        .str-chat__message-simple-text-inner {
          font-size: 0.9375rem !important;
          line-height: 1.4 !important;
        }

        .str-chat__avatar-image {
          width: 32px !important;
          height: 32px !important;
        }

        .str-chat__send-button {
          transition: all 0.5s ease !important;
        }

        .str-chat__send-button:hover {
          transform: scale(1.1) !important;
        }

        /* Custom scrollbar */
        .str-chat ::-webkit-scrollbar {
          width: 8px;
        }

        .str-chat ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .str-chat ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          transition: background 0.5s ease;
        }

        .str-chat ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default StreamerChatOverlay;
