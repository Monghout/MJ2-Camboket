// "use client";

// import { useEffect, useState } from "react";
// import { StreamChat } from "stream-chat";
// import { useUser } from "@clerk/nextjs";
// import { LoadingSpinner } from "@/app/component/LoadingSpinner";

// const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!;

// const StreamerInbox = () => {
//   const { user } = useUser(); // Get streamer user
//   const [chatClient, setChatClient] = useState<StreamChat | null>(null);
//   const [viewerChannels, setViewerChannels] = useState<any[]>([]);
//   const [activeChannel, setActiveChannel] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!user) return;

//     const initializeStreamerChat = async () => {
//       try {
//         // Fetch streamer token
//         const response = await fetch(`/api/streamChat/token?userId=${user.id}`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch token");
//         }
//         const { token } = await response.json();

//         const client = StreamChat.getInstance(apiKey);

//         await client.connectUser(
//           {
//             id: user.id,
//             name: user.fullName || "Streamer",
//             image: user.imageUrl,
//           },
//           token
//         );

//         // Fetch all viewer channels
//         const filters = {
//           type: "messaging",
//           members: { $in: [user.id] },
//           isPrivateViewerChannel: true, // Only fetch private channels
//         };

//         const channels = await client.queryChannels(filters, [], {
//           watch: true,
//         });
//         setViewerChannels(channels);
//         setChatClient(client);
//       } catch (error) {
//         console.error("Error fetching viewer channels:", error);
//         setError("Failed to load viewer chats. Please try again.");
//       }
//     };

//     initializeStreamerChat();

//     return () => {
//       if (chatClient) {
//         chatClient.disconnectUser();
//       }
//     };
//   }, [user]);

//   const handleChannelSelect = (channel: any) => {
//     setActiveChannel(channel);
//   };

//   if (error) return <div className="error">{error}</div>;

//   if (!chatClient) return <LoadingSpinner />;

//   return (
//     <div className="streamer-chat-inbox">
//       <div className="sidebar">
//         {viewerChannels.map((ch) => (
//           <button key={ch.id} onClick={() => handleChannelSelect(ch)}>
//             Chat with{" "}
//             {ch.state.members.find((m: { user: { id: string; }; }) => m.user?.id !== user.id)?.user?.name}
//           </button>
//         ))}
//       </div>

//       {activeChannel && (
//         <div className="active-chat">
//           <Chat client={chatClient} theme="str-chat__theme-dark">
//             <Channel channel={activeChannel}>
//               <Window>
//                 <MessageList />
//                 <MessageInput />
//               </Window>
//             </Channel>
//           </Chat>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StreamerInbox;
