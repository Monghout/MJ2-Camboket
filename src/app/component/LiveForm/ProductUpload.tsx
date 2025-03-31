"use client";

import type React from "react";
import { useState } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, ImagePlus, Tag, Trash2, Upload } from "lucide-react";

interface ProductUploadProps {
  product: {
    name: string;
    image: string;
    price: number;
    description: string;
    feature: boolean;
  };
  index: number;
  onUpdate: (
    index: number,
    product: {
      name: string;
      image: string;
      price: number;
      description: string;
      feature: boolean;
    }
  ) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export default function ProductUpload({
  product,
  index,
  onUpdate,
  error,
  setError,
}: ProductUploadProps) {
  const { edgestore } = useEdgeStore();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [priceError, setPriceError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size exceeds 2MB. Please upload a smaller image.");
        return;
      }

      setUploading(true);
      setError(null);

      const { url } = await edgestore.publicFiles.upload({
        file,
        options: {},
        onProgressChange: (progress) => {
          setUploadProgress(progress);
        },
      });

      onUpdate(index, {
        ...product,
        image: url,
        name: "",
      });
    } catch (error) {
      console.error("Upload failed", error);
      setError("Failed to upload product image. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    onUpdate(index, {
      ...product,
      image: "",
      name: "",
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input
    if (value === "") {
      setPriceError(null);
      onUpdate(index, { ...product, price: 0 });
      return;
    }

    // Check if the value is a valid number format (digits with optional decimal point)
    if (!/^(\d+\.?\d*|\.\d+)$/.test(value)) {
      setPriceError("Please enter a valid number");
      return;
    }

    // If the value starts with a decimal point, prepend a zero (e.g., ".5" becomes "0.5")
    const normalizedValue = value.startsWith(".") ? `0${value}` : value;

    const numericValue = parseFloat(normalizedValue);

    if (isNaN(numericValue)) {
      setPriceError("Price must be a valid number.");
    } else if (numericValue < 0) {
      setPriceError("Price cannot be less than zero.");
    } else {
      setPriceError(null);
      onUpdate(index, { ...product, price: numericValue });
    }
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    onUpdate(index, {
      ...product,
      feature: isChecked,
      name: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor={`product-name-${index}`}
            className="flex items-center gap-1"
          >
            <Tag className="h-3.5 w-3.5" />
            Product Title
          </Label>
          <Input
            id={`product-name-${index}`}
            placeholder="Enter product name"
            value={product.name}
            onChange={(e) =>
              onUpdate(index, { ...product, name: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`product-price-${index}`}
            className="flex items-center gap-1"
          >
            <DollarSign className="h-3.5 w-3.5" />
            Price
          </Label>
          <Input
            id={`product-price-${index}`}
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
            value={product.price === 0 ? "" : product.price.toString()}
            onChange={handlePriceChange}
          />
          {priceError && (
            <p className="text-sm text-destructive">{priceError}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`product-description-${index}`}>Description</Label>
        <Textarea
          id={`product-description-${index}`}
          placeholder="Describe your product"
          value={product.description}
          onChange={(e) =>
            onUpdate(index, {
              ...product,
              description: e.target.value,
              name: "",
            })
          }
          className="resize-none min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Product Image</Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.image ? (
            <div className="relative group">
              <div className="aspect-square rounded-md overflow-hidden bg-muted">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name || "Product"}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemoveImage}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          ) : (
            <Card className="aspect-square flex items-center justify-center bg-muted/50 border-dashed">
              <div className="text-center p-4">
                <ImagePlus className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No image uploaded
                </p>
              </div>
            </Card>
          )}

          <div className="flex flex-col justify-center space-y-2">
            {uploading ? (
              <div className="space-y-2">
                <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Input
                    type="file"
                    id={`product-image-${index}`}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {product.image ? "Replace Image" : "Upload Image"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Max file size: 2MB. Recommended size: 1:1 ratio
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor={`product-feature-${index}`}
          className="flex items-center gap-1"
        >
          <Tag className="h-3.5 w-3.5" />
          Feature Product
        </Label>
        <input
          type="checkbox"
          id={`product-feature-${index}`}
          checked={product.feature}
          onChange={handleFeatureChange}
          className="h-4 w-4"
        />
        <span className="ml-2 text-sm text-muted-foreground">
          Mark this product as featured
        </span>
      </div>
    </div>
  );
}
