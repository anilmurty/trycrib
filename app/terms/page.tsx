import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">TryCrib – Terms of Service</h1>
            <p className="text-lg text-gray-600">Last Updated: December 15, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-base text-gray-800 leading-7 mb-6">
              These Terms of Service ("Terms") govern your access to and use of the TryCrib website located at trycrib.com (the "Site") and any services we offer (collectively, the "Services"). By accessing or using the Services in any way, you agree to be bound by these Terms and our Privacy Policy.
            </p>
            <p className="text-base text-gray-800 leading-7 mb-12">
              If you do not agree to these Terms, do not use the Services.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">1. About TryCrib</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              TryCrib helps prospective home buyers experience living in a potential future home before purchase by enabling browsing of properties and booking short-term stays ("Experience Stays").
            </p>
            <p className="text-base text-gray-800 leading-7 mb-6">
              The Services may change over time — including adding paid features, bookings, verification, and bookings marketplace elements.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">2. Eligibility</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              By using the Services, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside text-base text-gray-800 mb-6 space-y-2 ml-4 leading-7">
              <li>You are at least 18 years old or the age of majority in your jurisdiction;</li>
              <li>You have legal capacity to enter into these Terms;</li>
              <li>You are not prohibited from using the Services by applicable law.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">3. Your Account</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              Some parts of the Services may require you to create an account.
              When you create an account, you agree that:
            </p>
            <ul className="list-disc list-inside text-base text-gray-800 mb-6 space-y-2 ml-4 leading-7">
              <li>You provide accurate, current, and complete information;</li>
              <li>You keep your account credentials secure;</li>
              <li>You are responsible for all activity under your account.</li>
            </ul>
            <p className="text-base text-gray-800 leading-7 mb-6">
              We may suspend or terminate accounts that violate these Terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">4. Use of the Services</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              You agree to use the Services only for lawful purposes and in compliance with all applicable laws. You may not:
            </p>
            <ul className="list-disc list-inside text-base text-gray-800 mb-6 space-y-2 ml-4 leading-7">
              <li>Interfere with the Services or servers;</li>
              <li>Attempt to access unauthorized areas of the Site;</li>
              <li>Use automated agents, bots, scrapers, or similar tools;</li>
              <li>Collect or harvest personal information of others;</li>
              <li>Engage in any activity that harms other users or TryCrib.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">5. Booking & Experience Stays</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              TryCrib may enable users to book short-term stays at properties listed on the Site.
              By booking a stay through the Services:
            </p>
            <ul className="list-disc list-inside text-base text-gray-800 mb-6 space-y-2 ml-4 leading-7">
              <li>You agree to any additional terms, policies, and payment terms presented at booking;</li>
              <li>You acknowledge that TryCrib is a facilitator, not a landlord or property manager;</li>
              <li>You agree that TryCrib is not responsible for the condition or safety of any property.</li>
            </ul>
            <p className="text-base text-gray-800 leading-7 mb-6">
              Any future payments, refunds, or cancellation terms will be governed by additional policies provided at the time of the transaction.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">6. Communications</h2>
            <p className="text-base text-gray-800 leading-7 mb-6">
              By providing your email or contact information, you agree to receive transactional messages and updates about your use of the Services. You may also receive marketing communications if you opt in. You can opt out of marketing emails at any time.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">7. Intellectual Property</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              All content on the Site — including text, graphics, logos, images, and software — is owned by TryCrib or its licensors and protected by applicable intellectual property laws.
            </p>
            <p className="text-base text-gray-800 leading-7 mb-6">
              You may not copy, modify, distribute, or use our content without express written permission.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">8. Third-Party Services</h2>
            <p className="text-base text-gray-800 leading-7 mb-6">
              The Site may contain links or integrations with third-party services (e.g., maps, listings, payment providers). TryCrib is not responsible for the practices, content, or policies of third parties. Your use of those services is governed by their terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">9. Privacy</h2>
            <p className="text-base text-gray-800 leading-7 mb-6">
              Your privacy is important. Our Privacy Policy explains how we collect, use, and share information. By using the Services, you agree to the terms of our Privacy Policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">10. Disclaimers</h2>
            <p className="text-base text-gray-800 leading-7 mb-4 font-semibold">
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, TRYCRIB DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-base text-gray-800 leading-7 mb-6">
              TryCrib does not guarantee that the Services will be uninterrupted, secure, or error-free.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">11. Limitation of Liability</h2>
            <p className="text-base text-gray-800 leading-7 mb-4 font-semibold">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRYCRIB AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICES.
            </p>
            <p className="text-base text-gray-800 leading-7 mb-6">
              In jurisdictions that do not allow the exclusion of certain warranties or liabilities, TryCrib's liability is limited to the greatest extent permitted by law.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">12. Indemnification</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              You agree to indemnify and hold harmless TryCrib and its officers, directors, employees, and agents from any claim, loss, liability, or expense (including attorney's fees) arising from:
            </p>
            <ul className="list-disc list-inside text-base text-gray-800 mb-6 space-y-2 ml-4 leading-7">
              <li>Your use of the Services;</li>
              <li>Your violation of these Terms;</li>
              <li>Your violation of any third-party rights.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">13. Governing Law</h2>
            <p className="text-base text-gray-800 leading-7 mb-6">
              These Terms are governed by the laws of the jurisdiction where TryCrib is established, without regard to conflict of law provisions.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">14. Changes</h2>
            <p className="text-base text-gray-800 leading-7 mb-6">
              We may modify these Terms at any time. We'll post the updated Terms with a revised "Last Updated" date. Continued use of the Services after changes constitutes acceptance.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">15. Contact</h2>
            <p className="text-base text-gray-800 leading-7 mb-4">
              If you have questions about these Terms, you may contact us at:
            </p>
            <ul className="list-none text-base text-gray-800 mb-12 space-y-2 leading-7">
              <li>
                <strong>Email:</strong> <Link href="mailto:anil.metabldr@gmail.com" className="text-blue-600 hover:text-blue-700 underline">anil.metabldr@gmail.com</Link>
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
