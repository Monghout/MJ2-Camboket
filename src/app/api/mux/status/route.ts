// pages/api/mux/status.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { streamId } = req.query;

    const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
    const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;
    // Replace with your Mux API credentials
    const MUX_API_URL = `https://api.mux.com/video/v1/live-streams/${streamId}`;
    const headers = {
      Authorization: `Bearer ${MUX_TOKEN_ID}`,
    };

    const response = await fetch(MUX_API_URL, { headers });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch stream status" });
    }

    const data = await response.json();
    const isLive = data.data.status === "active"; // Assuming the status is "active" when live

    res.status(200).json({ isLive });
  } catch (error) {
    res.status(500).json({ error: "Error fetching Mux stream status" });
  }
}
