"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

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
          {user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal" />
          )}
        </div>
      </header>
    </div>
  );
}
