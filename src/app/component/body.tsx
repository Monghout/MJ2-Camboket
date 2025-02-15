"use client";

import { useState } from "react";
import SellersPanel from "../component/seller_panel";
import ProductShowcase from "../component/product_showcase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import UserList from "./userlist";
import Chat from "@/app/component/chat"; // Assuming the Chat component is correctly imported

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
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-4">
            <div className="aspect-video bg-gray-200 mb-4 flex items-center justify-center">
              <span className="text-red-500 font-bold">LIVE</span>
            </div>
            <h3 className="font-semibold mb-2">Seller Name 1</h3>
            <p className="text-sm text-gray-600">Product Category</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="aspect-video bg-gray-200 mb-4 flex items-center justify-center">
              <span className="text-red-500 font-bold">LIVE</span>
            </div>
            <h3 className="font-semibold mb-2">Seller Name 2</h3>
            <p className="text-sm text-gray-600">Product Category</p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Bubble Icon */}
      <div
        className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition"
        onClick={toggleChat}
      >
        💬
      </div>

      {/* Chat Popup */}
      {showChat && (
        <div className="fixed bottom-16 right-4 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
              <h3 className="text-xl font-semibold">Chat</h3>
              <button className="text-red-500" onClick={toggleChat}>
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4"></div>
            <div className="p-4 border-t">
              {/* You can add an input box here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
