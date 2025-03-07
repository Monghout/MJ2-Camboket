"use client";

import { useState } from "react";
import ProductUpload from "@/app/component/LiveForm/ProductUpload";
import ThumbnailUpload from "@/app/component/LiveForm/ThumbnailUpload"; // Use the new ThumbnailUpload component

interface EditStreamFormProps {
  stream: {
    _id: string;
    sellerId: string;
    sellerName: string;
    title: string;
    description: string;
    category: string;
    products: {
      title: string;
      image: string;
      price: number;
      description: string;
    }[];
    thumbnail: string | null; // Now storing EdgeStore URL
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
  ];

  // Handle product updates
  const handleProductUpdate = (
    index: number,
    updatedProduct: {
      title: string;
      image: string;
      price: number;
      description: string;
    }
  ) => {
    const updatedProducts = [...products];
    updatedProducts[index] = updatedProduct;
    setProducts(updatedProducts);
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
          thumbnail, // Now storing EdgeStore URL
          isLive,
          products,
        }),
      });

      if (!response.ok) throw new Error("Failed to update stream");

      const updatedStream = await response.json();
      onUpdate(updatedStream);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Edit Stream</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 p-2 border rounded w-full min-h-[100px]"
        />
      </div>

      {/* Thumbnail Upload Section */}
      <div className="mt-4">
        <ThumbnailUpload
          onUpload={setThumbnail}
          error={error}
          setError={setError}
        />
      </div>

      {/* Product Upload Section */}
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-700">Products</h3>
        {products.map((product, index) => (
          <ProductUpload
            key={index}
            product={product}
            index={index}
            onUpdate={handleProductUpdate}
            error={error}
            setError={setError}
          />
        ))}
        <button
          type="button"
          onClick={() =>
            setProducts([
              ...products,
              { title: "", image: "", price: 0, description: "" },
            ])
          }
          className="mt-2 text-blue-500 hover:text-blue-700"
        >
          Add Product
        </button>
      </div>

      {/* Stream Status */}
      <div className="mt-4 flex items-center">
        <label className="text-sm font-medium text-gray-700 mr-2">
          Live Status:
        </label>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-4 py-2 rounded ${
            isLive ? "bg-green-500 text-white" : "bg-gray-400 text-white"
          }`}
        >
          {isLive ? "Live" : "Offline"}
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleUpdate}
        disabled={loading}
        className={`w-full mt-6 py-2 px-4 rounded ${
          loading ? "bg-gray-300" : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {loading ? "Updating..." : "Update Stream"}
      </button>
    </div>
  );
}
