import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch all data in parallel rather than sequentially
    const [livestreamsRes, usersRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/livestreams`,
        { next: { revalidate: 30 } } // Cache for 30 seconds
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user`,
        { next: { revalidate: 60 } } // Cache for 60 seconds
      ),
    ]);

    if (!livestreamsRes.ok) throw new Error("Failed to fetch livestreams");
    if (!usersRes.ok) throw new Error("Failed to fetch users");

    const [livestreamsData, usersData] = await Promise.all([
      livestreamsRes.json(),
      usersRes.json(),
    ]);

    // Find followed streams (optimize with early filtering)
    const followedStreams = livestreamsData.livestreams.filter((stream: any) =>
      stream.followers.some((follower: any) => follower.followerId === userId)
    );

    // Create a map of users for faster lookups
    const userMap = new Map();
    usersData.users.forEach((user: any) => {
      userMap.set(user._id, user);
    });

    // Process stream data into sellerId groups
    const sellerStreamsMap = new Map();
    for (const stream of followedStreams) {
      if (!sellerStreamsMap.has(stream.sellerId)) {
        sellerStreamsMap.set(stream.sellerId, []);
      }
      sellerStreamsMap.get(stream.sellerId).push({
        _id: stream._id,
        title: stream.title,
        liveStreamId: stream.liveStreamId,
        thumbnail: stream.thumbnail,
        isLive: stream.isLive,
      });
    }

    // Format response
    const following = Array.from(sellerStreamsMap.entries()).map(
      ([sellerId, streams]) => ({
        seller: userMap.get(sellerId),
        streams,
      })
    );

    return NextResponse.json({ success: true, following });
  } catch (error: any) {
    console.error("Error fetching following:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
