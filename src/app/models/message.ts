import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  senderId: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
