// components/InstructionOverlay.tsx
import React from "react";
import { X } from "lucide-react";

interface InstructionOverlayProps {
  onClose: () => void;
  streamKey?: string;
  rtmpUrl?: string;
}

const InstructionOverlay: React.FC<InstructionOverlayProps> = ({
  onClose,
  streamKey = "your-stream-key-here",
  rtmpUrl = "rtmp://global-live.mux.com:5222/app",
}) => {
  const steps = [
    {
      title: "Step 1: OBS Stream Settings",
      description: (
        <>
          - Open OBS → Settings → Stream <br />- Set <strong>Service</strong> to{" "}
          <code>Custom</code> <br />- Server:{" "}
          <code className="bg-black/10 p-1 rounded">{rtmpUrl}</code> <br />-
          Stream Key:{" "}
          <code className="bg-black/10 p-1 rounded">{streamKey}</code>
        </>
      ),
    },
    {
      title: "Step 2: Setup OBS Scene",
      description: (
        <>
          - Add Video Capture (webcam), Audio Input (mic), or screen share{" "}
          <br />- Customize overlays as needed
        </>
      ),
    },
    {
      title: "Step 3: Start Streaming",
      description: (
        <>
          - Click <strong>Start Streaming</strong> in OBS <br />- Your stream
          will appear on MUX in ~10 seconds
        </>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 text-white p-4 flex items-center justify-center animate-glow">
      <div className="relative bg-black border  rounded-lg max-w-2xl w-full p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-black border  rounded-full p-1 text-white hover:bg-gray-700 transition-colors"
          aria-label="Close instructions"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 ">
          <span className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center">
            📺
          </span>
          How to Stream with OBS + MUX
        </h2>

        <div className="space-y-4  ">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-black p-4 rounded-lg border border-gray-700 animate-glow"
            >
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                {step.title}
              </h3>
              <div className="text-sm leading-relaxed text-gray-100 pl-8">
                {step.description}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          You can close this overlay once you're ready to go live
        </p>
      </div>
    </div>
  );
};

export default InstructionOverlay;
