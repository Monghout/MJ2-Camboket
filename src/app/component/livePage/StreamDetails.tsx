import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye } from "lucide-react";
import ProductList from "@/app/component/livePage/ProductList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StreamDetailsProps {
  title: string;
  description: string;
  category: string;
  createdAt: string;
  products: any[];
  isSeller: boolean;
  onRemoveProduct: (productId: string) => void;
}

export default function StreamDetails({
  title,
  description,
  category,
  createdAt,
  products,
  isSeller,
  onRemoveProduct,
}: StreamDetailsProps) {
  return (
    <Card className="border-none shadow-xl bg-background">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>Live Stream</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>

        <Tabs defaultValue="products" className="mt-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4">
            <ProductList
              products={products}
              isSeller={isSeller}
              onRemoveProduct={onRemoveProduct}
            />
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Category
              </h3>
              <p>{category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Created
              </h3>
              <p>{new Date(createdAt).toLocaleDateString()}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
