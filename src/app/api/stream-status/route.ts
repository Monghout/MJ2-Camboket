// // /pages/api/live/status/update.ts

// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb"; // Your MongoDB connection function
// import Stream from "@/app/models/LiveStream"; // Your stream model
// import fetch from "node-fetch"; // Make sure you have node-fetch installed

// export async function GET(req: Request) {
//   try {
//     await connectDB();

//     // Fetch all streams from MongoDB that have a liveStreamId
//     const streams = await Stream.find({ liveStreamId: { $ne: null } });

//     if (!streams || streams.length === 0) {
//       return NextResponse.json(
//         { message: "No streams found" },
//         { status: 404 }
//       );
//     }

//     // Loop through each stream and get Mux API status
//     for (const stream of streams) {
//       // Fetch the stream status from Mux using the liveStreamId
//       const response = await fetch(
//         `https://api.mux.com/video/v1/live-streams/${stream.liveStreamId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.MUX_API_KEY}`, // Your Mux API key
//           },
//         }
//       );

//       const muxData = await response.json();

//       if (muxData.status) {
//         // Determine if the stream is live (active)
//         const isLive = muxData.status;

//         // Update MongoDB with the correct live status
//         await Stream.findByIdAndUpdate(stream._id, { isLive });
//       }
//     }

//     return NextResponse.json({
//       message: "Stream statuses updated successfully",
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
