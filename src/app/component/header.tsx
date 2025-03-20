"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import CheckoutButton from "./payment-button";
import Link from "next/link";

export default function Header() {
  const { user } = useUser();

  return (
    <div className="text-white p-6">
      {/* Header */}
      <header className="relative flex items-center justify-between">
        {/* Left Side - Logo */}
        <div className="left-28">
          <Link href="/" passHref>
            <img
              src="https://files.edgestore.dev/pd7j45rm5byeyxbm/publicFiles/_public/eae6848a-e4cc-4597-af06-fc128da1bd28.png"
              className="h-16 w-36 cursor-pointer"
              alt="Logo"
            />
          </Link>
        </div>

        {/* Centered Welcome Message */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-lg font-medium">
            <h1 className="text-2xl font-bold text-center">CamboKet</h1>
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
