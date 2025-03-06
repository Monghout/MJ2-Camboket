"use client";

interface StreamCreatedSuccessProps {
  streamDetails: {
    _id: string;
    title: string;
    sellerName: string;
    playbackId: string;
    streamKey: string;
  };
  onReset: () => void; // Callback to reset the form
}

const StreamCreatedSuccess = ({
  streamDetails,
  onReset,
}: StreamCreatedSuccessProps) => {
  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <h3 className="font-bold mb-2">Stream Created Successfully!</h3>
      <p className="mb-2">
        <strong>Seller:</strong> {streamDetails.sellerName}
      </p>
      <p className="mb-2">Use the following details to go live:</p>
      <div className="bg-white p-3 rounded border border-green-200 mb-3">
        <p className="font-semibold">Stream Key:</p>
        <input
          type="text"
          value={streamDetails.streamKey || "Loading..."}
          readOnly
          className="w-full p-2 bg-gray-100 border rounded mb-2"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <p className="font-semibold">Playback ID:</p>
        <input
          type="text"
          value={streamDetails.playbackId || "Loading..."}
          readOnly
          className="w-full p-2 bg-gray-100 border rounded"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
      </div>
      <p className="text-sm">
        Enter the Stream Key in your streaming software (like OBS) to start
        broadcasting. Viewers can watch your stream using the Playback ID.
      </p>
      <button
        onClick={onReset}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors duration-200"
      >
        Create Another Stream
      </button>
    </div>
  );
};

export default StreamCreatedSuccess;
