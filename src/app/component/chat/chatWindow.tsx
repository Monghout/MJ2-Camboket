"use client";
import { useChatSelection } from "@/app/provider/chat";
import {
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

export default function StreamerChatWindow() {
  const { selectedChannel } = useChatSelection();

  if (!selectedChannel) {
    return <div className="p-4 text-gray-400">Select a viewer chat</div>;
  }

  return (
    <Channel channel={selectedChannel}>
      <Window>
        <MessageList />
        <MessageInput />
      </Window>
      <Thread />
    </Channel>
  );
}
