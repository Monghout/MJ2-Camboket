import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-6 text-gray-600">
        Last Updated: {new Date().toLocaleDateString()}
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          1. Information We Collect
        </h2>
        <p className="mb-4">
          CamboKet collects information to provide and improve our Service. This
          includes:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>
            <strong>Account Information:</strong> Name, email, profile picture
            when you register (via Clerk authentication)
          </li>
          <li>
            <strong>Stream Data:</strong> Information about your live streams,
            including duration and viewer metrics
          </li>
          <li>
            <strong>Product Information:</strong> Details of products listed for
            sale
          </li>
          <li>
            <strong>Transaction Data:</strong> Purchase history and payment
            information
          </li>
          <li>
            <strong>Communication:</strong> Messages sent through our chat
            system (Stream Chat)
          </li>
          <li>
            <strong>Technical Data:</strong> IP address, browser type, device
            information
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          2. How We Use Information
        </h2>
        <p className="mb-4">We use collected information to:</p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Provide, maintain, and improve our Service</li>
          <li>
            Process transactions and facilitate communication between users
          </li>
          <li>Personalize user experience</li>
          <li>Monitor and analyze usage patterns</li>
          <li>Detect and prevent fraud and abuse</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Data Sharing</h2>
        <p className="mb-4">We may share information with:</p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>
            <strong>Service Providers:</strong> Such as MUX for streaming,
            Stream for chat, and MongoDB for data storage
          </li>
          <li>
            <strong>Business Partners:</strong> When necessary to provide the
            Service
          </li>
          <li>
            <strong>Legal Authorities:</strong> When required by law or to
            protect our rights
          </li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to
          protect your data, including:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Secure authentication via Clerk</li>
          <li>Encryption of sensitive data</li>
          <li>Regular security assessments</li>
        </ul>
        <p>
          However, no method of transmission over the Internet is 100% secure,
          and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
        <p className="mb-4">
          Depending on your jurisdiction, you may have rights including:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Access to your personal data</li>
          <li>Correction of inaccurate data</li>
          <li>Deletion of your data</li>
          <li>Restriction or objection to processing</li>
          <li>Data portability</li>
        </ul>
        <p>To exercise these rights, contact us at the information below.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Cookies & Tracking</h2>
        <p className="mb-4">
          CamboKet uses cookies and similar technologies to:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Authenticate users</li>
          <li>Remember preferences</li>
          <li>Analyze Service usage</li>
        </ul>
        <p>You can control cookies through your browser settings.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          7. Changes to This Policy
        </h2>
        <p className="mb-4">
          We may update this Privacy Policy periodically. We will notify users
          of significant changes through the Service or by email.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
        <p className="mb-4">
          For questions about this Privacy Policy, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> camboketco.cambo@gmail.com
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
