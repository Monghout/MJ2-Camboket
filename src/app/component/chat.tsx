import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { path: "/api/socketio" });

export default function Chat({
  senderId,
  receiverId,
}: {
  senderId: string;
  receiverId: string;
}) {
  const [messages, setMessages] = useState<
    { senderId: string; text: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch initial messages from the database (you can use SWR or any data-fetching tool)
  useEffect(() => {
    // Fetch previous messages between the two users
    async function fetchMessages() {
      const res = await fetch(`/api/chat/${senderId}/${receiverId}`);
      const data = await res.json();
      setMessages(data.messages);
    }

    fetchMessages();

    // Set up socket to listen for incoming messages
    socket.on("receiveMessage", (message) => {
      if (
        (message.senderId === senderId && message.receiverId === receiverId) ||
        (message.senderId === receiverId && message.receiverId === senderId)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [senderId, receiverId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = { senderId, receiverId, text: newMessage };

    // Send the message to the backend (this will also trigger Socket.io on the server)
    await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    });

    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage("");
  };

  return (
    <div className="chat-container">
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.senderId === senderId ? "sent" : "received"
            }`}
          >
            <strong>{msg.senderId}</strong>: {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="message-input"
      />
      <button onClick={sendMessage} className="send-button">
        Send
      </button>
    </div>
  );
}
