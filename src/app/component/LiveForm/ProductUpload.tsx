"use client";

import { useState, ChangeEvent } from "react";
import { useEdgeStore } from "@/lib/edgestore";

interface ProductUploadProps {
  product: { title: string; image: string };
  index: number;
  onUpdate: (index: number, product: { title: string; image: string }) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const ProductUpload = ({
  product,
  index,
  onUpdate,
  error,
  setError,
}: ProductUploadProps) => {
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    try {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size exceeds 2MB. Please upload a smaller image.");
        return;
      }

      const { url } = await edgestore.publicFiles.upload({ file, options: {} });
      onUpdate(index, { ...product, image: url });
    } catch (error) {
      console.error("Upload failed", error);
      setError("Failed to upload product image. Please try again.");
    }
  };

  return (
    <div className="mb-4 p-3 border rounded">
      <input
        type="text"
        placeholder="Product title"
        value={product.title}
        onChange={(e) => onUpdate(index, { ...product, title: e.target.value })}
        className="border rounded p-2 mb-2 w-full"
      />
      <input
        type="file"
        onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
        className="mb-2"
        accept="image/*"
      />
      {product.image ? (
        <div>
          <img
            src={product.image}
            alt="Product"
            className="w-16 h-16 object-cover border"
          />
          <p className="text-xs text-green-600 mt-1">Image uploaded</p>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Please upload a product image</p>
      )}
    </div>
  );
};

export default ProductUpload;
