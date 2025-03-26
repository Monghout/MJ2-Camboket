"use client";

import { useState } from "react";
import SellersPanel from "./seller_panel";
import ProductShowcase from "./product_showcase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import UserList from "./userlist";
// import LiveStreamPage from "../livestream/[id]/page";
import MuxPlayer from "@mux/mux-player-react";
import CompareUserAndSellerIds from "./userCompare";
import StreamIdDisplay from "./userCompare";
import LiveStreamsPage from "./LiveStreamsPage";
import Carousal from "./carousal";
import { SignedIn, SignedOut } from "@clerk/nextjs";

// import LiveStreamsPage from "./LiveStreamsPage";

// import LivePage from './livePage';
// import LiveStreamPage from "../live/[id]/page";

export default function LandingPage() {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="container text-white mx-auto px-4 py-8">
      <div className="flex gap-4 mb-8">
        <Carousal />

        {/* Featured Section with separated components */}
      </div>
      <LiveStreamsPage />
    </div>
  );
}
