import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Seller {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
}

const sellers: Seller[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: `Seller ${i + 1}`,
  avatar: "/placeholder.svg?height=40&width=40",
  isOnline: true,
}));

export default function FeaturedSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-black rounded-xl overflow-hidden">
      {/* Sellers List */}
      <Card className="md:col-span-1 bg-black border-0">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold text-white mb-4">
            You Find these product at
          </h2>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
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

      {/* Product Display */}
      <Card className="md:col-span-3 bg-black">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square relative">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Page%20Guest-3-brbil8gOTD7GrDVGyvuJDHMD0XIRuK.png"
                alt="Samsung Phone Front View"
                fill
                className="object-contain"
              />
            </div>
            <div className="aspect-square relative">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Page%20Guest-3-brbil8gOTD7GrDVGyvuJDHMD0XIRuK.png"
                alt="Samsung Phone Side View"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="mt-4 ">
            <h3 className="text-xl font-bold">Samsung Galaxy Ultra</h3>
            <p className="text-gray-600">Latest model with S-Pen included</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
