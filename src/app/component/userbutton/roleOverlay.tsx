import React from "react";

interface RoleOverlayProps {
  currentUser: {
    role: string;
    subscriptionStatus: string;
  };
  onCancelRoleChange: () => void;
  onClose: () => void;
}

export default function RoleOverlay({
  currentUser,
  onCancelRoleChange,
  onClose,
}: RoleOverlayProps) {
  return (
    <div className="fixed inset-0 border-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-neutral-900 p-6 rounded shadow-lg max-w-md w-full border-2"
        style={{ borderColor: "rgba(255, 255, 255, 0.6)" }}
      >
        <h2 className="text-xl font-bold mb-4">Subscription & Role Info</h2>
        <p>
          <strong>Role:</strong> {currentUser.role}
        </p>
        <p>
          <strong>Subscription Status:</strong> {currentUser.subscriptionStatus}
        </p>
        <div className="mt-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            onClick={onCancelRoleChange}
          >
            Cancel Role Change (Buyer)
          </button>
          <button
            className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
