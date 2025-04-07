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
import {
  ShoppingBag,
  Check,
  User,
  MessageSquare,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!;

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  featured: boolean;
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
  products: Product[];
}

interface ChatComponentProps {
  streamerId: string;
  stream: Stream | null;
  isStreamer: boolean;
}

const ChatOverlay = ({
  streamerId,
  stream,
  isStreamer,
}: ChatComponentProps) => {
  const { user } = useUser();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [channels, setChannels] = useState<StreamChannel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
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

        if (isStreamer) {
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
        } else {
          const channelId = `${streamerId.slice(0, 24)}-${user.id.slice(
            0,
            24
          )}`;
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
  }, [user, streamerId, isStreamer]);

  const getOtherMember = (channel: StreamChannel) => {
    const members = Object.values(channel.state.members);
    const otherMember = members.find((member) => member.user_id !== streamerId);
    return {
      name: otherMember?.user?.name || "Anonymous",
      image: otherMember?.user?.image || null,
      id: otherMember?.user_id || "unknown",
    };
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(productId)) {
        newSelected.delete(productId);
      } else {
        newSelected.add(productId);
      }
      return newSelected;
    });
  };
  const confirmSelectedProducts = async () => {
    if (!channel || !stream || selectedProducts.size === 0) return;

    // Get the full product details from the stream's products
    const selectedProductsToSend = stream.products.filter((product) =>
      selectedProducts.has(product._id)
    );

    if (selectedProductsToSend.length === 0) return;

    // Create the message text with proper markdown formatting
    const messageText = selectedProductsToSend
      .map((product) => {
        let productText = `**${product.name}** - $${product.price}`;
        if (product.image) {
          productText += `\n![${product.name}](${product.image})`;
        }
        return productText;
      })
      .join("\n\n"); // Add extra line breaks between products

    try {
      await channel.sendMessage({
        text: `Selected Products:\n${messageText}`,
      });
      setSelectedProducts(new Set());
    } catch (error) {
      console.error("Error sending product message:", error);
    }
  };
  const sortedProducts = stream?.products
    ? [...stream.products].sort((a, b) => (b.featured ? 1 : 0))
    : [];

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (error) {
    return (
      <div className=" text-white bg-red-500/20 p-4 rounded-md border border-red-500 animate-pulse">
        {error}
      </div>
    );
  }

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
        className="bg-white text-black p-4 flex justify-between items-center border-b rounded-lg border-white/20 cursor-pointer transition-all duration-500 border-2 hover:border-white/30"
        onClick={toggleMinimize}
      >
        <div className="flex items-center gap-3 truncate">
          <MessageSquare className="h-6 w-6 flex-shrink-0" />
          {!isMinimized && <span className="font-semibold text-xl">Chat</span>}
          {isMinimized && (
            <span className="font-semibold text-md truncate">
              Talk to Seller
            </span>
          )}{" "}
          <div className="absolute w-3 h-3 rounded-full bg-green-400 opacity-75 animate-ping"></div>
          <div className="relative w-2 h-2 rounded-full bg-green-500 animate-bounce"></div>
        </div>
        <div className="flex items-center gap-3"></div>
      </div>

      {!isMinimized && (
        <div className="flex h-[calc(100%-60px)] bg-black text-white transition-all duration-500">
          {/* Main Chat Section */}
          <div className={`${isStreamer ? "w-3/4" : "flex-1"} max-w-4xl`}>
            <div className="h-full bg-black overflow-hidden">
              {chatClient ? (
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  {isStreamer ? (
                    <div className="flex h-full">
                      {/* Channel List */}
                      <div className="w-1/3 p-4 border-r border-white/10 bg-black overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          <span>Active Chats</span>
                        </h3>

                        {channels.length === 0 ? (
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
                                          src={
                                            otherMember.image ||
                                            "/placeholder.svg"
                                          }
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

                      {/* Selected Channel */}
                      <div className="w-2/3">
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
                          <div className="flex flex-col items-center justify-center h-full text-white/70 p-6">
                            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-xl font-light">
                              Select a chat to start messaging
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
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
              ) : (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="medium" />
                </div>
              )}
            </div>
          </div>

          {/* Product Section (for viewers) */}
          {!isStreamer && (
            <div className="w-1/3 flex flex-col border-l border-white/10 bg-black">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Products</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {sortedProducts.length > 0 ? (
                  <div className="space-y-4">
                    {/* Featured Products */}
                    {sortedProducts
                      .filter((product) => product.featured)
                      .map((product) => (
                        <Card
                          key={product._id}
                          className={`bg-black hover:bg-white/5 transition-all duration-500 border border-white/20 ${
                            selectedProducts.has(product._id)
                              ? "ring-2 ring-white border-white"
                              : ""
                          }`}
                          onClick={() => toggleProductSelection(product._id)}
                        >
                          <div className="aspect-video relative">
                            <img
                              src={
                                product.image ||
                                "/placeholder.svg?height=200&width=300"
                              }
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            {product.featured && (
                              <div className="absolute top-0 left-0 p-2">
                                <div className="bg-white text-black font-bold px-3 py-1 rounded-full text-xs">
                                  Featured
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 right-0 p-2">
                              <div className="bg-white text-black font-bold px-3 py-1 rounded-full text-xs">
                                ${product.price}
                              </div>
                            </div>
                            {selectedProducts.has(product._id) && (
                              <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                                <div className="bg-white rounded-full p-2">
                                  <Check className="h-6 w-6 text-black" />
                                </div>
                              </div>
                            )}
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
                          className={`bg-black hover:bg-white/5 transition-all duration-500 border border-white/20 ${
                            selectedProducts.has(product._id)
                              ? "ring-2 ring-white border-white"
                              : ""
                          }`}
                          onClick={() => toggleProductSelection(product._id)}
                        >
                          <div className="aspect-video relative">
                            <img
                              src={
                                product.image ||
                                "/placeholder.svg?height=200&width=300"
                              }
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 p-2">
                              <div className="bg-white text-black font-bold px-3 py-1 rounded-full text-xs">
                                ${product.price}
                              </div>
                            </div>
                            {selectedProducts.has(product._id) && (
                              <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                                <div className="bg-white rounded-full p-2">
                                  <Check className="h-6 w-6 text-black" />
                                </div>
                              </div>
                            )}
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

              {/* Confirm Button - Now fixed at the bottom */}
              <div className="p-4 border-t border-white/10 bg-black sticky bottom-0">
                <button
                  className={`w-full py-3 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    selectedProducts.size === 0
                      ? "bg-white/10 text-white/50 cursor-not-allowed"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                  onClick={confirmSelectedProducts}
                  disabled={selectedProducts.size === 0}
                >
                  <Check className="h-5 w-5 mr-2" />
                  Confirm Selection ({selectedProducts.size})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* When minimized, show a small preview */}
      {isMinimized && (
        <div className="h-[calc(100%-60px)] bg-black p-2 flex items-center justify-center"></div>
      )}

      {/* Custom CSS to override Stream Chat styles */}
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

export default ChatOverlay;
