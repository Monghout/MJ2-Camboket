"use client";

import { useState } from "react";
import ThumbnailUpload from "./ThumbnailUpload";
import ProductUpload from "./ProductUpload";

interface StreamFormProps {
  categories: string[];
  onSubmit: (data: {
    sellerName: string; // Add sellerName
    category: string;
    streamTitle: string;
    streamDescription: string;
    products: { title: string; image: string }[];
    thumbnailUrl: string | null;
  }) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const StreamForm = ({
  categories,
  onSubmit,
  error,
  setError,
}: StreamFormProps) => {
  const [sellerName, setSellerName] = useState(""); // Add sellerName state
  const [category, setCategory] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [products, setProducts] = useState<{ title: string; image: string }[]>(
    []
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const addProduct = () => {
    setProducts((prev) => [...prev, { title: "", image: "" }]);
  };

  const handleSubmit = () => {
    if (!sellerName || !category || !streamTitle || !streamDescription) {
      setError("Please fill out all required fields.");
      return;
    }

    onSubmit({
      sellerName, // Pass sellerName
      category,
      streamTitle,
      streamDescription,
      products,
      thumbnailUrl,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2 font-medium">Your Name:</label>
        <input
          type="text"
          value={sellerName}
          onChange={(e) => setSellerName(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Category:</label>
        <select
          className="border rounded p-2 w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium">Stream Title:</label>
        <input
          type="text"
          value={streamTitle}
          onChange={(e) => setStreamTitle(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter an engaging title for your stream"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">Stream Description:</label>
        <textarea
          value={streamDescription}
          onChange={(e) => setStreamDescription(e.target.value)}
          className="border rounded p-2 w-full min-h-[100px]"
          placeholder="Describe what you'll be showcasing in this stream"
        />
      </div>

      <ThumbnailUpload
        onUpload={setThumbnailUrl}
        error={error}
        setError={setError}
      />

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Products</h3>
        {products.length === 0 && (
          <p className="text-sm text-gray-500 mb-2">
            Add products to showcase in your stream
          </p>
        )}
        {products.map((product, index) => (
          <ProductUpload
            key={index}
            product={product}
            index={index}
            onUpdate={(index, updatedProduct) => {
              const updatedProducts = [...products];
              updatedProducts[index] = updatedProduct;
              setProducts(updatedProducts);
            }}
            error={error}
            setError={setError}
          />
        ))}
        <button
          onClick={addProduct}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors duration-200"
        >
          Add Product
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={
          !sellerName ||
          !category ||
          !streamTitle ||
          !streamDescription ||
          products.some((p) => !p.title || !p.image)
        }
        className={`w-full py-3 px-4 text-lg font-semibold rounded transition-colors duration-200 ${
          !sellerName ||
          !category ||
          !streamTitle ||
          !streamDescription ||
          products.some((p) => !p.title || !p.image)
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        Create Live Stream
      </button>
    </div>
  );
};

export default StreamForm;
