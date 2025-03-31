"use client";
import { Trash } from "lucide-react";
import { useState } from "react";
import ProductUpload from "@/app/component/LiveForm/ProductUpload";
import ThumbnailUpload from "@/app/component/LiveForm/ThumbnailUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Save, Video } from "lucide-react";

interface EditStreamFormProps {
  stream: {
    _id: string;
    sellerId: string;
    sellerName: string;
    title: string;
    description: string;
    category: string;
    products: {
      name: string;
      image: string;
      price: number;
      description: string;
      feature: boolean;
    }[];
    thumbnail: string | null;
    isLive: boolean;
    streamKey: string;
    playbackId: string;
    createdAt: string;
  };
  onUpdate: (updatedStream: any) => void;
}

export default function EditStreamForm({
  stream,
  onUpdate,
}: EditStreamFormProps) {
  const [title, setTitle] = useState(stream.title);
  const [description, setDescription] = useState(stream.description);
  const [category, setCategory] = useState(stream.category);
  const [thumbnail, setThumbnail] = useState<string | null>(stream.thumbnail);
  const [isLive, setIsLive] = useState(stream.isLive);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(stream.products);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "Electronics",
    "Phones",
    "Clothes",
    "Kitchen",
    "Home Appliances",
    "Books",
    "Toys",
    "Sports",
    "Health",
    "Beauty",
    "Drinks",
  ];

  // Handle product updates
  const handleProductUpdate = (
    index: number,
    updatedProduct: {
      name: string;
      image: string;
      price: number;
      description: string;
      feature: boolean;
    }
  ) => {
    const updatedProducts = [...products];
    updatedProducts[index] = updatedProduct;
    setProducts(updatedProducts);
  };
  const handleRemoveProduct = (indexToRemove: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Handle form submission
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/live/${stream._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          thumbnail,
          isLive,
          products,
        }),
      });

      if (!response.ok) throw new Error("Failed to update stream");

      const updatedStream = await response.json();
      onUpdate(updatedStream);
    } catch (error) {
      console.error(error);
      setError("Failed to update stream. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addNewProduct = () => {
    setProducts([
      ...products,
      { name: "", image: "", price: 0.0, description: "", feature: false },
    ]);
  };

  return (
    <div className="dark min-h-screen bg-background p-6">
      <Card className="max-w-5xl mx-auto border-none shadow-xl bg-background">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" />
              Edit Stream
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            Update your stream details before going live
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/20 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Shop name</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a catchy title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your stream"
                  className="min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div className="border border-border rounded-lg overflow-hidden">
                  <ThumbnailUpload
                    onUpload={setThumbnail}
                    error={error}
                    setError={setError}
                  />
                </div>
              </div>

              {thumbnail && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={thumbnail || "/placeholder.svg"}
                    alt="Stream thumbnail"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Products</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addNewProduct}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {products.map((product, index) => (
                <Card key={index} className="bg-card/50 relative">
                  <CardContent className="pt-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-3 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <ProductUpload
                      product={product}
                      index={index}
                      onUpdate={handleProductUpdate}
                      error={error}
                      setError={setError}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                "Updating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Update Stream
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
