import { Facebook, Instagram, Twitter, Github } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black/10 text-white py-6 border-white animate-glow">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
          <div>
            <p className="text-sm">All rights reserved CamBoKet</p>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <h3 className="font-semibold text-white">ABOUT</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link href="/legal/about" className="hover:underline">
                    Camboket
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white">FOLLOW US</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <a
                    href="https://github.com/Monghout"
                    className="hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Github
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white">LEGAL</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link href="/legal/privacy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/t&c" className="hover:underline">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-4 text-gray-400">
          <a href="#" aria-label="Facebook">
            <Facebook className="w-5 h-5 hover:text-white" />
          </a>
          <a href="#" aria-label="Instagram">
            <Instagram className="w-5 h-5 hover:text-white" />
          </a>
          <a href="#" aria-label="Twitter">
            <Twitter className="w-5 h-5 hover:text-white" />
          </a>
          <a
            href="https://github.com/Monghout"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5 hover:text-white" />
          </a>
        </div>
      </div>
    </footer>
  );
}
