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
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, X } from "lucide-react"; // Import the X icon

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

const StreamerChatComponent = ({
  streamerId,
  stream,
}: StreamerChatComponentProps) => {
  const { user } = useUser();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [channels, setChannels] = useState<StreamChannel[]>([]); // List of all active channels
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const initializeChatClient = async () => {
      try {
        // Fetch the Stream Chat token from your backend
        const response = await fetch(`/api/streamChat/token?userId=${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch token");
        }

        const { token } = await response.json();

        // Initialize the Stream Chat client
        const client = StreamChat.getInstance(apiKey);

        await client.connectUser(
          {
            id: user.id,
            name: user.fullName || user.username || "Anonymous",
            image: user.imageUrl,
          },
          token
        );

        // Fetch all active channels where the streamer is a member
        const filter = { type: "messaging", members: { $in: [streamerId] } };
        const sort = [{ last_message_at: -1 as const }]; // Sort by most recent message
        const channels = await client.queryChannels(filter, sort, {
          watch: true,
          state: true,
        });

        setChannels(channels);

        // Automatically select the first channel if available
        if (channels.length > 0) {
          setChannel(channels[0]);
        }

        setChatClient(client);
      } catch (error) {
        console.error("Error initializing Stream Chat client:", error);
        setError("Failed to initialize chat. Please try again.");
      }
    };

    initializeChatClient();

    // Cleanup on unmount
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [user, streamerId]);

  // Function to remove a channel from the list and archive it
  const removeChannel = async (channelId: string) => {
    const channelToRemove = channels.find((ch) => ch.id === channelId);
    if (channelToRemove) {
      try {
        // Archive the channel
        await channelToRemove.stopWatching(); // Stop watching the channel
        await channelToRemove.hide(); // Hide the channel from queries
      } catch (error) {
        console.error("Error archiving channel:", error);
      }
    }

    // Update the UI
    setChannels((prevChannels) =>
      prevChannels.filter((ch) => ch.id !== channelId)
    );

    // If the removed channel is the currently selected channel, clear the selection
    if (channel?.id === channelId) {
      setChannel(null);
    }
  };

  // Function to get the other member's name in the channel
  const getOtherMemberName = (channel: StreamChannel) => {
    const members = Object.values(channel.state.members);
    const otherMember = members.find((member) => member.user_id !== streamerId);
    return otherMember?.user?.name || "Anonymous";
  };

  if (error) {
    return (
      <div className="text-white bg-red-500/20 p-4 rounded-md">{error}</div>
    );
  }

  if (!chatClient) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative h-screen border-10">
      <div className="flex h-screen bg-transparent z-10 relative rounded-lg border-2">
        {/* Channel List Section */}
        <div className="w-1/4 p-4 border-r border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Active Chats
          </h3>
          {channels.map((ch) => (
            <div
              key={ch.id}
              className={`p-2 hover:bg-gray-700 cursor-pointer flex justify-between items-center ${
                channel?.id === ch.id ? "bg-gray-700" : ""
              }`}
            >
              <p
                className="text-white truncate flex-1"
                onClick={() => setChannel(ch)}
              >
                {getOtherMemberName(ch)} {/* Display the other member's name */}
              </p>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => removeChannel(ch.id!)}
              >
                <X className="h-4 w-4" /> {/* X icon for removing the chat */}
              </button>
            </div>
          ))}
        </div>

        {/* Chat Section */}
        <div className="flex-1 max-w-4xl mx-auto">
          <div className="h-full backdrop-blur-sm bg-gray-900/40 overflow-hidden">
            <Chat client={chatClient} theme="str-chat__theme-dark">
              {channel ? (
                <Channel channel={channel}>
                  <Window>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput />
                  </Window>
                  <Thread />
                </Channel>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  Select a chat to start messaging.
                </div>
              )}
            </Chat>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamerChatComponent;
