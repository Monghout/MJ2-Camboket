import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash2 } from "lucide-react";
import { DollarSign } from "lucide-react";

interface ProductListProps {
  products: any[];
  isSeller: boolean;
  onRemoveProduct: (productId: string) => void;
}

export default function ProductList({
  products,
  isSeller,
  onRemoveProduct,
}: ProductListProps) {
  return (
    <>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product, index) => (
            <Card
              key={index}
              className="overflow-hidden bg-card/50 border-none"
            >
              <div className="aspect-video relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 right-0 p-2">
                  <Badge
                    variant="secondary"
                    className="bg-black/70 backdrop-blur-sm"
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    {product.price}
                  </Badge>
                </div>
                {isSeller && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => onRemoveProduct(product._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium truncate">{product.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>No products available for this stream</p>
        </div>
      )}
    </>
  );
}
