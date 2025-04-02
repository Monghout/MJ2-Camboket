import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      <p className="mb-6 text-gray-600">
        Last Updated: {new Date().toLocaleDateString()}
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using the CamboKet platform ("Service"), you agree to
          be bound by these Terms and Conditions ("Terms"). If you disagree with
          any part of the terms, you may not access the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
        <p className="mb-4">
          To use certain features of CamboKet, you must register for an account.
          You agree to:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain the security of your password</li>
          <li>Accept all risks of unauthorized access to your account</li>
        </ul>
        <p>
          CamboKet uses Clerk for authentication and reserves the right to
          suspend or terminate accounts that violate these Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          3. Live Streaming & Sales
        </h2>
        <p className="mb-4">Sellers using CamboKet agree to:</p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Provide accurate descriptions of products</li>
          <li>Honor prices and terms stated during live streams</li>
          <li>Comply with all applicable laws and regulations</li>
        </ul>
        <p>
          CamboKet is not responsible for disputes between buyers and sellers
          but may intervene at our discretion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Content & Conduct</h2>
        <p className="mb-4">Users agree not to:</p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Transmit harmful, unlawful, or abusive content</li>
          <li>Impersonate any person or entity</li>
          <li>Interfere with the Service's operation</li>
          <li>Violate intellectual property rights</li>
        </ul>
        <p>
          CamboKet may remove content and restrict access to users who violate
          these standards.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Privacy</h2>
        <p className="mb-4">
          Your use of CamboKet is subject to our Privacy Policy, which explains
          how we collect, use, and protect your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Modifications</h2>
        <p className="mb-4">
          CamboKet reserves the right to modify these Terms at any time. We will
          provide notice of significant changes, and continued use of the
          Service constitutes acceptance of the modified Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          7. Limitation of Liability
        </h2>
        <p className="mb-4">
          CamboKet shall not be liable for any indirect, incidental, special, or
          consequential damages resulting from:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Use or inability to use the Service</li>
          <li>Unauthorized access to transmissions or data</li>
          <li>Statements or conduct of any third party on the Service</li>
        </ul>
      </section>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
