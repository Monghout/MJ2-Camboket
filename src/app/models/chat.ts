// models/Chat.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  streamerId: {
    type: String,
    required: true,
  },
  viewerId: {
    type: String,
    required: true,
  },
  messages: [messageSchema], // Array of messages
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster queries
chatSchema.index({ streamerId: 1, viewerId: 1 }, { unique: true }); // Ensure one chat per viewer per streamer
chatSchema.index({ isActive: 1 }); // For querying active chats

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
