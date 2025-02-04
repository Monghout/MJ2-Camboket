import SellersPanel from "../component/seller_panel";
import ProductShowcase from "../component/product_showcase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Live Streaming E-Market
      </h1>

      {/* Featured Section with separated components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <SellersPanel />
        </div>
        <div className="md:col-span-3">
          <ProductShowcase />
        </div>
      </div>

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
    </div>
  );
}
