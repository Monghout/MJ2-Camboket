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
import { ShoppingBag, Check } from "lucide-react"; // Import Check icon for confirmation

const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!;

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  featured: boolean; // Add a featured field
}

interface Stream {
  _id: string;
  title: string;
  category: string;
  description: string;
  isLive: boolean;
  thumbnail?: string;
  sellerId: string;
  sellerName: string;
  products: Product[]; // Use the updated Product interface
}

interface ChatComponentProps {
  streamerId: string;
  stream: Stream | null;
  isStreamer: boolean; // Add this prop to differentiate between streamer and viewer
}

const ChatComponent = ({
  streamerId,
  stream,
  isStreamer,
}: ChatComponentProps) => {
  const { user } = useUser();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [channels, setChannels] = useState<StreamChannel[]>([]); // For streamer's list of channels
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  ); // Track selected products

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

        if (isStreamer) {
          // Streamer: Fetch all active channels where the streamer is a member
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
        } else {
          // Viewer: Create and watch their own channel with the streamer
          const channelId = `${streamerId.slice(0, 24)}-${user.id.slice(
            0,
            24
          )}`; // Shorten the channel ID
          const channel = client.channel("messaging", channelId, {
            members: [streamerId, user.id],
          });
          await channel.watch();
          setChannel(channel);
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
  }, [user, streamerId, isStreamer]);

  // Function to handle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(productId)) {
        newSelected.delete(productId); // Deselect if already selected
      } else {
        newSelected.add(productId); // Select if not already selected
      }
      return newSelected;
    });
  };

  // Function to confirm selected products and send them to the chat
  const confirmSelectedProducts = async () => {
    if (!channel || selectedProducts.size === 0) return;

    // Get the selected products' details
    const selectedProductDetails = stream?.products
      .filter((product) => selectedProducts.has(product._id))
      .map((product) => ({
        name: product.name,
        price: product.price,
        image: product.image || "/placeholder.svg",
      }));

    if (!selectedProductDetails || selectedProductDetails.length === 0) return;

    // Format the message with product details
    const messageText = selectedProductDetails
      .map(
        (product) =>
          `**${product.name}** - $${product.price}\n![${product.name}](${product.image})`
      )
      .join("\n");

    // Send the selected products as a message to the chat
    await channel.sendMessage({
      text: `Selected Products:\n${messageText}`,
    });

    // Clear the selected products
    setSelectedProducts(new Set());
  };

  // Sort products: featured products first, then non-featured
  const sortedProducts = stream?.products
    ? [...stream.products].sort((a, b) => (b.featured ? 1 : -1))
    : [];

  if (error) {
    return (
      <div className="text-white bg-red-500/20 p-4 rounded-md">{error}</div>
    );
  }

  if (!chatClient || (!channel && !isStreamer)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative h-screen border-10">
      <div className="flex h-screen bg-transparent z-10 relative rounded-lg border-2">
        {/* Chat Section */}
        <div className="flex-1 max-w-4xl mx-auto">
          <div className="h-full backdrop-blur-sm bg-gray-900/40 overflow-hidden">
            <Chat client={chatClient} theme="str-chat__theme-dark">
              {isStreamer ? (
                // Streamer's View: List of channels and selected channel
                <div className="flex h-full">
                  {/* Channel List */}
                  <div className="w-1/4 p-4 border-r border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-white">
                      Active Chats
                    </h3>
                    {channels.map((ch) => (
                      <div
                        key={ch.id}
                        className={`p-2 hover:bg-gray-700 cursor-pointer ${
                          channel?.id === ch.id ? "bg-gray-700" : ""
                        }`}
                        onClick={() => setChannel(ch)}
                      >
                        <p className="text-white truncate">
                          {ch.id?.replace(`${streamerId}-`, "")}{" "}
                          {/* Display viewer ID */}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Selected Channel */}
                  <div className="w-3/4">
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
                  </div>
                </div>
              ) : (
                // Viewer's View: Single chat with the streamer
                <Channel channel={channel!}>
                  <Window>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput />
                  </Window>
                  <Thread />
                </Channel>
              )}
            </Chat>
          </div>
        </div>

        {/* Product Section (for viewers) */}
        {!isStreamer && (
          <div className="w-1/4 backdrop-blur-sm p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              All Product
            </h3>
            {sortedProducts.length > 0 ? (
              <div className="space-y-2">
                {/* Featured Products */}
                {sortedProducts
                  .filter((product) => product.featured)
                  .map((product) => (
                    <Card
                      key={product._id}
                      className={`hover:border-white transition-all duration-300 ${
                        selectedProducts.has(product._id)
                          ? "border-2 border-blue-500"
                          : ""
                      }`}
                      onClick={() => toggleProductSelection(product._id)}
                    >
                      <div className="aspect-video relative">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 p-2">
                          <div className="bg-emerald-500/90 text-white font-bold px-3 py-1 rounded-full text-xs">
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

                {/* Non-Featured Products */}
                {sortedProducts
                  .filter((product) => !product.featured)
                  .map((product) => (
                    <Card
                      key={product._id}
                      className={`hover:border-white transition-all duration-300 ${
                        selectedProducts.has(product._id)
                          ? "border-2 border-blue-500"
                          : ""
                      }`}
                      onClick={() => toggleProductSelection(product._id)}
                    >
                      <div className="aspect-video relative">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 p-2">
                          <div className="bg-emerald-500/90 text-white font-bold px-3 py-1 rounded-full text-xs">
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

                {/* Confirm Button */}
                <button
                  className="w-full bg-blue-500 text-white py-2 rounded-md mt-4 flex items-center justify-center"
                  onClick={confirmSelectedProducts}
                  disabled={selectedProducts.size === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Selection
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No products available for this stream</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
