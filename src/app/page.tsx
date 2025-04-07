"use client"; // Add this since we'll be using client-side features

import Header from "./component/header";
import Footer from "./component/footer";
import { SignedIn } from "@clerk/nextjs";
import Body from "./component/body";
import { SignedOut } from "@clerk/nextjs/dist/types/components.server";
import { useEffect } from "react";
import { toast } from "sonner"; // or your preferred toast library
import { getCookie } from "cookies-next"; // Install with: npm install cookies-next

export default function GuestHomePage() {
  useEffect(() => {
    // Check for flash message cookie
    const flashMessage = getCookie("flash_message");

    if (flashMessage) {
      try {
        const { type, text } = JSON.parse(flashMessage.toString());
        if (type === "success") {
          toast.success(text);
        } else if (type === "error") {
          toast.error(text);
        }
        // Clear the cookie
        document.cookie = "flash_message=; Max-Age=0; path=/";
      } catch (error) {
        console.error("Error parsing flash message:", error);
      }
    }
  }, []);

  return (
    <div>
      <Header />
      <Body />
      <Footer />
    </div>
  );
}
