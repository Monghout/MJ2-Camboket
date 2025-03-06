"use client";

import { useState, useCallback } from "react";

interface EditStreamFormProps {
  stream: {
    _id: string;
    sellerId: string;
    sellerName: string;
    title: string;
    description: string;
    category: string;
    products: any[];
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
  const [thumbnail, setThumbnail] = useState(stream.thumbnail || "");
  const [isLive, setIsLive] = useState(stream.isLive);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Track drag state

  // Define categories
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

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setThumbnail(e.target.result as string); // Set the thumbnail as a base64 string
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file);
    }
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
        }),
      });

      if (!response.ok) throw new Error("Failed to update stream");

      const updatedStream = await response.json();
      onUpdate(updatedStream); // Pass updated data back to the parent
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

      {/* Thumbnail Upload */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Thumbnail
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-1 p-6 border-2 border-dashed rounded-lg text-center ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <p className="text-gray-600">
            Drag & drop an image here, or{" "}
            <label
              htmlFor="thumbnail-upload"
              className="text-blue-500 cursor-pointer hover:underline"
            >
              click to upload
            </label>
          </p>
          <input
            id="thumbnail-upload"
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          {thumbnail && (
            <div className="mt-4">
              <img
                src={thumbnail}
                alt="Thumbnail Preview"
                className="w-32 h-32 object-cover rounded mx-auto"
              />
            </div>
          )}
        </div>
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
