import { StreamChat } from "stream-chat";

export const serverSideClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);
