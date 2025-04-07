"use client";

import { useState } from "react";
import SellersPanel from "./seller_panel";
import ProductShowcase from "./product_showcase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import UserList from "./userlist";
import MuxPlayer from "@mux/mux-player-react";
import CompareUserAndSellerIds from "./userCompare";
import StreamIdDisplay from "./userCompare";
import LiveStreamsPage from "./LiveStreamsPage";
import Carousal from "./carousal";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Following from "./following";

export default function LandingPage() {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="container max-w-full px-4 py-6 text-white">
      {/* Carousel Section */}
      <div className="mb-8">
        <Carousal />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Live Streams Section */}
        <div className="lg:col-span-4">
          <LiveStreamsPage />
        </div>

        {/* Following Sidebar */}
        <div className="lg:col-span-1 border border-gray-700 rounded-2xl p-4 animate-glow">
          <Following />
        </div>
      </div>
    </div>
  );
}
