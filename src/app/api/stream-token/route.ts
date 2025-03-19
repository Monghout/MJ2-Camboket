import { StreamChat } from "stream-chat";

export default async function handler(
  req: { body: { userId: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { token: string }): void; new (): any };
    };
  }
) {
  const { userId } = req.body;

  const serverClient = StreamChat.getInstance(
    process.env.PUBLIC_STREAM_KEY!,
    process.env.STREAM_SECRET_KEY!
  );

  const token = serverClient.createToken(userId);
  res.status(200).json({ token });
}
