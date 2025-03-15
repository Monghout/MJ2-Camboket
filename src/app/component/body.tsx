"use client";

import { useState } from "react";
import SellersPanel from "../component/seller_panel";
import ProductShowcase from "../component/product_showcase";
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
      <h1 className="text-4xl font-bold mb-8 text-center">CamboKet</h1>
      {/* Featured Section with separated components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <SellersPanel />
        </div>{" "}
        <div className="md:col-span-3">
          <ProductShowcase />
        </div>
      </div>
      <UserList />
      {/* Search and Filter */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search for products or sellers"
            className="pl-10 pr-4 py-2 w-full"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={20} />
          Filter
        </Button>
      </div>
      {/* Live Stream Placeholders */}

      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Stream Information</h1>
        <StreamIdDisplay />
      </div>
      <LiveStreamsPage />
    </div>
  );
}
