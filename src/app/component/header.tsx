"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import CheckoutButton from "./payment-button";

export default function Header() {
  const { user } = useUser();

  return (
    <div className="bg-black text-white p-6">
      {/* Header */}
      <header className="relative flex items-center justify-between">
        {/* Left Side - Logo */}
        <div className="left-28">
          <img src="./logo-2.png" className="h-16 w-36" alt="Logo" />
        </div>

        {/* Centered Welcome Message */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-lg font-medium">
            Welcome, {user ? user.username : "Guest"}
          </span>
        </div>

        {/* Right Side - User Button */}
        <div className="flex items-center gap-4">
          <CheckoutButton />
          {user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="px-6 py-3 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transition">
              <SignInButton mode="modal" />
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
