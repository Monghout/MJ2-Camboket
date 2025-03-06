"use client";

import { useState, ChangeEvent } from "react";
import { useEdgeStore } from "@/lib/edgestore";

interface ThumbnailUploadProps {
  onUpload: (url: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const ThumbnailUpload = ({
  onUpload,
  error,
  setError,
}: ThumbnailUploadProps) => {
  const { edgestore } = useEdgeStore();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File size exceeds 2MB. Please upload a smaller image.");
      return;
    }

    try {
      const { url } = await edgestore.publicFiles.upload({ file, options: {} });
      setThumbnailUrl(url);
      onUpload(url);
      console.log("Thumbnail uploaded successfully:", url);
    } catch (error) {
      console.error("Thumbnail upload failed", error);
      setError("Failed to upload thumbnail. Please try again.");
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 font-medium">Thumbnail (2MB max):</label>
      <input
        type="file"
        onChange={handleThumbnailUpload}
        accept="image/*"
        className="mb-2"
      />
      {thumbnailUrl ? (
        <div>
          <img
            src={thumbnailUrl}
            alt="Thumbnail Preview"
            className="w-32 h-32 object-cover mb-2 border"
          />
          <p className="text-sm text-green-600">
            Thumbnail uploaded successfully
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Please upload a thumbnail image for your stream
        </p>
      )}
    </div>
  );
};

export default ThumbnailUpload;
