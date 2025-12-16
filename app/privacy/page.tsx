import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">TryCrib – Privacy Policy</h1>
            <p className="text-lg text-gray-600">Last updated: December 15, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-base text-gray-800 leading-7 mb-6">
              At TryCrib ("we", "our", or "us"), we value your privacy. This Privacy Policy explains what information we collect, how we use it, and your choices regarding that information.
            </p>
            <p className="text-base text-gray-800 leading-7 mb-12">
              By using <Link href="https://www.trycrib.com" className="text-blue-600 hover:text-blue-700 underline">https://www.trycrib.com</Link> (the "Website"), you agree to the practices described in this policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Information You Provide</h3>
            <p className="text-base text-gray-800 leading-7 mb-4">
              When you use TryCrib, you may voluntarily provide information such as:
            </p>
            <ul className="list-disc list-inside text-base text-gray-800 mb-6 space-y-2 ml-4 leading-7">
              <li>Your name</li>
              <li>Your email address</li>
              <li>Account-related information</li>
              <li>Any information you submit through forms, sign-ups, or communications with us</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Information Collected Automatically</h3>
            <p className="text-base text-gray-800 leading-7 mb-4">
              When you visit the Website, we automatically collect certain information, including:
            </p>
            <ul className="list-disc list-inside text-base text-gray-800 mb-6 space-y-2 ml-4 leading-7">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Pages visited and usage data</li>
            </ul>
            <p className="text-base text-gray-800 leading-7 mb-6">
              This information helps us understand how the Website is used and improve it over time.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Cookies</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              We use cookies to operate and improve the Website.
            </p>
            <ul className="list-disc list-inside text-base text-gray-800 mb-6 space-y-2 ml-4 leading-7">
              <li>Essential cookies are required for basic functionality.</li>
              <li>Analytics cookies help us understand usage patterns and improve performance.</li>
              <li>We currently plan to use Google Analytics for analytics purposes.</li>
              <li>You can control or disable cookies through your browser settings.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">How We Use Your Information</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-base text-gray-800 mb-6 space-y-2 ml-4 leading-7">
              <li>Provide and maintain TryCrib</li>
              <li>Create and manage user accounts</li>
              <li>Respond to inquiries and support requests</li>
              <li>Send product updates or marketing communications (only if you opt in)</li>
              <li>Improve our Website and services</li>
              <li>Monitor and analyze usage and trends</li>
            </ul>
            <p className="text-base text-gray-800 leading-7 mb-6">
              We do not sell your personal information.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Email Communications</h2>
            <p className="text-base text-gray-800 leading-7 mb-6">
              If you opt in, we may send you emails about product updates, announcements, or related information.
              You can unsubscribe at any time using the link in our emails.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Payments</h2>
            <p className="text-base text-gray-800 leading-7 mb-6">
              TryCrib does not currently process payments.
              If this changes in the future, this Privacy Policy will be updated to reflect how payment-related information is handled.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Third-Party Services</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              We may use third-party services to operate TryCrib, such as:
            </p>
            <ul className="list-disc list-inside text-base text-gray-800 mb-6 space-y-2 ml-4 leading-7">
              <li>Hosting providers</li>
              <li>Analytics providers (e.g., Google Analytics)</li>
              <li>Email or communication tools</li>
            </ul>
            <p className="text-base text-gray-800 leading-7 mb-6">
              These providers only have access to information necessary to perform their services and are required to protect your data.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Data Security</h2>
            <p className="text-base text-gray-800 leading-7 mb-6">
              We take reasonable measures to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Your Rights</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-base text-gray-800 mb-6 space-y-2 ml-4 leading-7">
              <li>Access your personal data</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw consent for communications</li>
            </ul>
            <p className="text-base text-gray-800 leading-7 mb-6">
              You can exercise these rights by contacting us.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Children's Privacy</h2>
            <p className="text-base text-gray-800 leading-7 mb-6">
              TryCrib is not intended for children under the age of 13, and we do not knowingly collect personal information from children.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Changes to This Policy</h2>
            <p className="text-base text-gray-800 leading-7 mb-6">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">Contact</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              If you have any questions about this Privacy Policy, you can contact us at:
            </p>
            <ul className="list-none text-base text-gray-800 mb-12 space-y-2 leading-7">
              <li>
                <strong>Email:</strong> <Link href="mailto:support@trycrib.com" className="text-blue-600 hover:text-blue-700 underline">support@trycrib.com</Link>
              </li>
              <li>
                <strong>Website:</strong> <Link href="https://www.trycrib.com" className="text-blue-600 hover:text-blue-700 underline">https://www.trycrib.com</Link>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
