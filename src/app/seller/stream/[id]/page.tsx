"use client";

import { notFound } from "next/navigation";
import MuxPlayer from "@mux/mux-player-react";
import { useEffect, useState } from "react";
import EditStreamForm from "@/app/component/editStreamForm"; // Import the edit form

interface StreamPageProps {
  params: { id: string };
}

export default function StreamPage({ params }: StreamPageProps) {
  const [stream, setStream] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreamData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/live/${params.id}`);
        if (!response.ok) throw new Error("Stream not found");
        const data = await response.json();
        setStream(data.stream);
        setSeller(data.seller);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamData();
  }, [params.id]);

  if (loading) return <p>Loading...</p>;
  if (!stream) return notFound();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Mux Player */}
      <div className="mb-8">
        <MuxPlayer
          playbackId={stream.playbackId}
          streamType="live"
          autoPlay
          muted
          className="w-full h-96 rounded-lg shadow-lg"
        />
      </div>

      {/* Stream Details */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">{stream.title}</h1>
        <p className="text-gray-700 mb-4">{stream.description}</p>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Seller Information</h2>
          <p>
            <strong>Name:</strong> {seller?.name || "Unknown"}
          </p>
          <p>
            <strong>Email:</strong> {seller?.email || "Unknown"}
          </p>
        </div>

        {/* Products */}
        {stream.products.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stream.products.map((product: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-gray-600">${product.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Stream Section */}
        <EditStreamForm stream={stream} onUpdate={setStream} />
      </div>
    </div>
  );
}
