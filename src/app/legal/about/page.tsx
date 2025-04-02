import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About CamboKet</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Our Platform</h2>
        <p className="mb-4">
          CamboKet is an innovative live-stream shopping platform that
          revolutionizes the way people buy and sell products online. We combine
          the excitement of live video streaming with the convenience of
          e-commerce, creating a dynamic social shopping experience.
        </p>
        <p>
          Our platform connects sellers who want to showcase their products in
          real-time with buyers who enjoy interactive, engaging shopping
          experiences.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-black p-4 rounded-lg">
            <h3 className="text-xl font-medium mb-2">For Sellers</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Go live and showcase your products in real-time</li>
              <li>Interact directly with potential buyers</li>
              <li>Upload and manage products before streaming</li>
              <li>Use our seller dashboard to track performance</li>
            </ul>
          </div>
          <div className="bg-black p-4 rounded-lg">
            <h3 className="text-xl font-medium mb-2">For Buyers</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Discover products through live streams</li>
              <li>Chat privately with sellers about items</li>
              <li>Track selected products in your live checklist</li>
              <li>Follow favorite sellers for updates</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
        <p className="mb-4">
          CamboKet is built with cutting-edge technologies to ensure a seamless
          experience:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Live Streaming:</strong> Powered by MUX for high-quality
            video
          </li>
          <li>
            <strong>Real-time Chat:</strong> Stream Chat enables instant
            communication
          </li>
          <li>
            <strong>Secure Authentication:</strong> Clerk ensures safe user
            accounts
          </li>
          <li>
            <strong>Reliable Database:</strong> MongoDB stores all platform data
          </li>
          <li>
            <strong>Modern Interface:</strong> Built with Next.js 15 and
            TailwindCSS
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
        <p>
          We aim to transform e-commerce by making shopping more interactive,
          personal, and engaging through live streaming technology. CamboKet
          bridges the gap between online shopping and the in-store experience by
          enabling real-time product demonstrations and direct seller-buyer
          communication.
        </p>
      </section>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
