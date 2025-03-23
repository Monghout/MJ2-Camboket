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
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";
import { DollarSign } from "lucide-react";
import Wave from "@/app/component/design/spbg";

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

interface ChatComponentProps {
  streamerId: string;
  stream: Stream | null;
}

const ChatComponent = ({ streamerId, stream }: ChatComponentProps) => {
  const { user } = useUser(); // Get the authenticated user from Clerk
  const [chatClient, setChatClient] = useState<StreamChat | null>(null); // Properly type the state
  const [channel, setChannel] = useState<StreamChannel | null>(null); // Add channel state
  const [error, setError] = useState<string | null>(null); // Add error state

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

        // Create and watch the streamer's channel
        const channel = client.channel("messaging", `stream-${streamerId}`);
        await channel.watch();

        setChatClient(client); // Set the client
        setChannel(channel); // Set the channel
      } catch (error) {
        console.error("Error initializing Stream Chat client:", error);
        setError("Failed to initialize chat. Please try again."); // Set error message
      }
    };

    initializeChatClient();

    // Cleanup on unmount
    return () => {
      if (chatClient) {
        chatClient.disconnectUser(); // Disconnect the user when the component unmounts
      }
    };
  }, [user, streamerId]); // Re-run when the user or streamerId changes

  if (error) {
    return (
      <div className="text-white bg-red-500/20 p-4 rounded-md">{error}</div>
    ); // Display error message
  }

  if (!chatClient || !channel) {
    return <LoadingSpinner />; // Show a loading spinner while the client and channel initialize
  }

  return (
    <div className="relative h-screen border-10 ">
      {/* Space Background with Satellite */}
      {/* <Wave /> */}

      <div className="flex h-screen bg-transparent z-10 relative rounded-lg border-2">
        {/* Chat Section */}
        <div className="flex-1 max-w-4xl mx-auto">
          <div className="h-full backdrop-blur-sm bg-gray-900/40 overflow-hidden ">
            <Chat client={chatClient} theme="str-chat__theme-dark">
              <Channel channel={channel}>
                <Window>
                  {stream && <div></div>}
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            </Chat>
          </div>
        </div>

        {/* Product Section */}
        <div className="w-1/4 backdrop-blur-sm p-4 overflow-y-auto  ">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Featured Products
          </h3>
          {stream?.products && stream.products.length > 0 ? (
            <div className="space-y-2">
              {stream.products.map((product) => (
                <Card
                  key={product._id}
                  className="hover:border-white transition-all duration-300"
                >
                  <div className="aspect-video relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 p-2 ">
                      <div className="bg-emerald-500/90 text-white font-bold px-3 py-1 rounded-full text-xs ">
                        $ {product.price}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium truncate text-white">
                      {product.name}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No products available for this stream</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
