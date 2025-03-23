// pages/api/streamChat/createChannel.ts
import { NextApiRequest, NextApiResponse } from "next";
import { StreamChat } from "stream-chat";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { streamerId } = req.body;

  if (!streamerId) {
    return res.status(400).json({ error: "Streamer ID is required" });
  }

  try {
    const serverClient = StreamChat.getInstance(
      process.env.STREAM_CHAT_API_KEY!,
      process.env.STREAM_CHAT_API_SECRET!
    );

    // Create a channel for the streamer
    const channel = serverClient.channel("messaging", `stream-${streamerId}`, {
      name: `Stream Chat - ${streamerId}`,
      created_by_id: streamerId,
    });

    await channel.create();
    res.status(200).json({ channelId: channel.id });
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ error: "Failed to create channel" });
  }
}
