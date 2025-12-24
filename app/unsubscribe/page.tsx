"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { useSearchParams } from "next/navigation"

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const [status, setStatus] = useState<"loading" | "success" | "error" | "notfound">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token && !email) {
      setStatus("notfound")
      setMessage("Invalid unsubscribe link. Please check your email and try again.")
      return
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch("/api/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, email }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(data.message || "You have been successfully unsubscribed from marketing emails.")
        } else {
          setStatus("error")
          setMessage(data.error || "An error occurred. Please try again later.")
        }
      } catch (error) {
        setStatus("error")
        setMessage("An error occurred. Please try again later.")
      }
    }

    unsubscribe()
  }, [token, email])

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            {status === "loading" && (
              <>
                <div className="mb-4">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Processing your request...</h1>
                <p className="text-lg text-gray-600">Please wait while we update your preferences.</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Successfully Unsubscribed</h1>
                <p className="text-lg text-gray-600 mb-6">{message}</p>
                <p className="text-base text-gray-500">
                  You will no longer receive marketing emails from TryCrib. You will still receive important transactional emails related to your account, stay requests, property listings, and other account activities.
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
                <p className="text-lg text-gray-600 mb-6">{message}</p>
                <p className="text-base text-gray-500">
                  If you continue to experience issues, please contact us at{" "}
                  <a href="mailto:support@trycrib.com" className="text-blue-600 hover:text-blue-700 underline">
                    support@trycrib.com
                  </a>
                </p>
              </>
            )}

            {status === "notfound" && (
              <>
                <div className="mb-4">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Link</h1>
                <p className="text-lg text-gray-600 mb-6">{message}</p>
                <p className="text-base text-gray-500">
                  If you need help unsubscribing, please contact us at{" "}
                  <a href="mailto:support@trycrib.com" className="text-blue-600 hover:text-blue-700 underline">
                    support@trycrib.com
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading...</h1>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
