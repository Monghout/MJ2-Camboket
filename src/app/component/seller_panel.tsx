import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Seller {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
}

const sellers: Seller[] = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  name: `Seller ${i + 1}`,
  avatar: "/placeholder.svg?height=40&width=40",
  isOnline: Math.random() > 0.3,
}));

export default function SellersPanel() {
  return (
    <Card className="bg-black border-0 h-[500px] flex flex-col">
      <CardContent className="p-4 flex-grow">
        <h2 className="text-xl font-bold text-white mb-4">
          You Find these product at
        </h2>
        <ScrollArea className="h-[calc(100%-2rem)]">
          <div className="space-y-4 pr-4">
            {sellers.map((seller) => (
              <div key={seller.id} className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-gray-800">
                    <AvatarImage src={seller.avatar} alt={seller.name} />
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
      </CardContent>
    </Card>
  );
}
