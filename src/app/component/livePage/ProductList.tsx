import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Rating {
  _id: string;
  rating: number;
}

interface Product {
  _id?: string;
  name: string;
  price: number;
  image: string;
  description: string;
  feature: boolean;
  ratings?: Rating[];
  averageRating?: number;
}

interface ProductListProps {
  products: Product[];
  isSeller: boolean;
  onRemoveProduct: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  selectedProduct: Product | null;
}

// Helper function to safely format rating values
const formatRating = (value?: number | null | undefined): string => {
  // Convert value to a number type explicitly
  const numericValue = Number(value);

  // Check if it's a valid number (not NaN)
  return isNaN(numericValue) ? "0.0" : numericValue.toFixed(1);
};

export default function ProductList({
  products,
  isSeller,
  onRemoveProduct,
  onSelectProduct,
  selectedProduct,
}: ProductListProps) {
  return (
    <div className="space-y-4">
      {products.map((product, index) => {
        // Use _id if available, otherwise fall back to array index
        const productId = product._id || index.toString();
        const isSelected =
          selectedProduct?._id === product._id || selectedProduct === product;

        return (
          <div
            key={productId}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
            }`}
            onClick={() => onSelectProduct(product)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm ml-1">
                      {formatRating(product.averageRating)}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      ({product.ratings?.length || 0})
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-bold">${product.price.toFixed(2)}</p>
                {isSeller && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveProduct(productId);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            {product.feature && (
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Featured
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
