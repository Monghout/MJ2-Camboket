import { Facebook, Instagram, Twitter, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-6">
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
                  <a className="hover:underline">Camboket</a>
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
                  >
                    Github
                  </a>
                </li>
                <li></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white">LEGAL</h3>
              <ul className="mt-2 space-y-1">
                <li>
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-4 text-gray-400">
          <a href="#">
            <Facebook className="w-5 h-5 hover:text-white" />
          </a>
          <a href="#">
            <Instagram className="w-5 h-5 hover:text-white" />
          </a>
          <a href="#">
            <Twitter className="w-5 h-5 hover:text-white" />
          </a>
          <a href="#">
            <Github className="w-5 h-5 hover:text-white" />
          </a>
        </div>
      </div>
    </footer>
  );
}
