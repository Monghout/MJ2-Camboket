"use client";

import type React from "react";

import { useState } from "react";
import { useEdgeStore } from "@/lib/edgestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";

interface ThumbnailUploadProps {
  onUpload: (url: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export default function ThumbnailUpload({
  onUpload,
  error,
  setError,
}: ThumbnailUploadProps) {
  const { edgestore } = useEdgeStore();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false); // Track drag state

  const handleThumbnailUpload = async (file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File size exceeds 2MB. Please upload a smaller image.");
      return;
    }

    try {
      setUploading(true);

      const { url } = await edgestore.publicFiles.upload({
        file,
        options: {},
        onProgressChange: (progress) => {
          setUploadProgress(progress);
        },
      });

      setThumbnailUrl(url);
      onUpload(url);
      console.log("Thumbnail uploaded successfully:", url);
    } catch (error) {
      console.error("Thumbnail upload failed", error);
      setError("Failed to upload thumbnail. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleThumbnailUpload(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailUrl(null);
    onUpload("");
  };

  // Drag-and-drop handlers
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
    if (file) {
      handleThumbnailUpload(file);
    }
  };

  return (
    <div className="relative">
      <div
        className={`relative bg-background rounded-lg border border-border p-4 ${
          isDragging ? "border-primary" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">
            Stream Thumbnail
          </h3>
          {thumbnailUrl && !uploading && (
            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
              Uploaded
            </span>
          )}
        </div>

        <div
          className={`aspect-video rounded-lg overflow-hidden mb-4 bg-muted ${
            isDragging ? "border-2 border-dashed border-primary" : ""
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground mt-2">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : thumbnailUrl ? (
            <div className="relative group h-full">
              <img
                src={thumbnailUrl || "/placeholder.svg"}
                alt="Stream Thumbnail"
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemoveThumbnail}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove thumbnail</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-3">
                {isDragging ? "Drop the image here" : "No thumbnail uploaded"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 16:9 ratio (1280×720 or 1920×1080)
              </p>
            </div>
          )}
        </div>

        {!uploading && (
          <div className="space-y-3">
            <div className="relative">
              <Input
                id="thumbnail-upload"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {thumbnailUrl ? "Replace Thumbnail" : "Upload Thumbnail"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Max file size: 2MB. A good thumbnail helps your stream stand out.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
