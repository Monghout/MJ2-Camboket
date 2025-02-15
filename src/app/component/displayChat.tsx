"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { path: "/api/socketio" });

export default function Chat({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<
    { senderId: string; text: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false); // State to handle the open/close of the chat

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = { senderId: userId, text: newMessage };
    socket.emit("sendMessage", message);
    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage("");
  };

  return (
    <div>
      {/* Floating Chat Bubble */}
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Close Chat" : <span className="text-xl">💬</span>}
      </button>

      {/* Chat Pop-up Window */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 bg-white border border-gray-300 rounded-lg shadow-lg w-80 p-4 z-50">
          <h2 className="text-xl font-bold mb-2">Chat</h2>
          <div className="h-60 overflow-y-auto border p-2 mb-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded mb-2 ${
                  msg.senderId === userId ? "bg-blue-200" : "bg-gray-200"
                }`}
              >
                <strong>{msg.senderId}</strong>: {msg.text}
              </div>
            ))}
          </div>
          <input
            className="border p-2 w-full"
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 mt-2 w-full"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
