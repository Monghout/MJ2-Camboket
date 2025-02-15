"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Seller {
  clerkId: string;
  name: string;
  email: string;
  role: string;
  isOnline?: boolean; // We'll simulate this since it's not in your DB
}

export default function SellersPanel() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();

        if (data.success) {
          // Filter only users with role "seller"
          const sellerUsers = data.users.filter(
            (user: Seller) => user.role === "seller"
          );

          // Add random online status for visual effect
          const sellersWithStatus = sellerUsers.map((seller: Seller) => ({
            ...seller,
            isOnline: Math.random() > 0.3,
          }));

          setSellers(sellersWithStatus);
        }
      } catch (error) {
        console.error("Error fetching sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  return (
    <Card className="bg-black border-0 h-[500px] flex flex-col">
      <CardContent className="p-4 flex-grow">
        <h2 className="text-xl font-bold text-white mb-4">
          You can find these products at
        </h2>

        {loading ? (
          <p className="text-white">Loading sellers...</p>
        ) : sellers.length === 0 ? (
          <p className="text-white">No sellers found.</p>
        ) : (
          <ScrollArea className="h-[calc(100%-2rem)]">
            <div className="space-y-4 pr-4">
              {sellers.map((seller) => (
                <div
                  key={seller.clerkId}
                  className="flex items-center space-x-4"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-gray-800">
                      <AvatarImage
                        src={`/placeholder.svg?height=40&width=40`}
                        alt={seller.name}
                      />
                      <AvatarFallback>{seller.name[0]}</AvatarFallback>
                    </Avatar>
                    {seller.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
                    )}
                  </div>
                  <span className="text-white">{seller.name}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
