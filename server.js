import { Server } from "socket.io";
import { createServer } from "http";
import mongoose from "mongoose";
import Message from "./models/Message"; // Message model (Step 3)

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:3000/chat";

// Connect to MongoDB
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.io...");

    const httpServer = createServer();
    const io = new Server(httpServer, {
      path: "/api/socketio",
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("sendMessage", async (message) => {
        console.log("New message:", message);

        // Save message to MongoDB
        const newMessage = new Message(message);
        await newMessage.save();

        io.emit("receiveMessage", message);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
