import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductShowcase() {
  return (
    <Card className="bg-black h-[500px] flex flex-col">
      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="grid grid-cols-2 gap-4 flex-grow">
          <div className="relative">
            <Image
              src=""
              alt="Samsung Phone Front View"
              fill
              className="object-contain"
            />
          </div>
          <div className="relative">
            <Image
              src=""
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
  );
}
