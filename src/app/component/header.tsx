"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import CheckoutButton from "./payment-button";
import Link from "next/link";
import ModeToggle from "@/app/component/DarkModebutton";
export default function Header() {
  const { user, isLoaded } = useUser();

  return (
    <div className="bg-black/10 text-white px-8 py-6 animate-glow">
      <header className="grid grid-cols-3 items-center text-center">
        {/* Left - Logo */}
        <div className="flex justify-start">
          <Link href="/" passHref>
            <img
              src="https://files.edgestore.dev/pd7j45rm5byeyxbm/publicFiles/_public/eae6848a-e4cc-4597-af06-fc128da1bd28.png"
              className="h-14 w-auto cursor-pointer"
              alt="Logo"
            />
          </Link>
        </div>

        {/* Center - App Name & Welcome */}
        <div>
          <h1 className="text-2xl font-bold">CamboKet</h1>
          <p className="text-sm">
            Welcome, {isLoaded ? user?.fullName || "Guest" : "Loading..."}
          </p>
        </div>

        {/* Right - Buttons */}
        <div className="flex justify-end items-center gap-4">
          <CheckoutButton />
          {user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="px-4 py-2 bg-black border-white border-2 text-white text-md rounded-lg hover:bg-white hover:text-black transition">
              <SignInButton mode="modal" />
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
