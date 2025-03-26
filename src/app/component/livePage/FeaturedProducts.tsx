import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

interface FeaturedProductsProps {
  products: any[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  // Filter products where the 'feature' property is true
  const featuredProducts = products.filter((product) => product.feature);

  return (
    <Card className="border-none shadow-xl bg-background">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          Featured Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Render the first 3 featured products */}
          {featuredProducts.slice(0, 3).map((product, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-sm text-primary">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
