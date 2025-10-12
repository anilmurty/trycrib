"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Home, Search, Calendar, CheckCircle, Upload, DollarSign } from "lucide-react"

export function HowItWorksContent() {
  const [activeTab, setActiveTab] = useState("buyer")

  const buyerSteps = [
    {
      icon: Search,
      title: "Browse Properties",
      description:
        "Explore homes currently on the market without creating an account. View photos, details, and availability.",
    },
    {
      icon: Calendar,
      title: "Create Account & Verify",
      description: "Sign up when ready to book. Upload your pre-approval letter to verify your buying capacity.",
    },
    {
      icon: Home,
      title: "Request & Stay",
      description: "Request a short-term stay to experience living in the home before making an offer.",
    },
    {
      icon: CheckCircle,
      title: "Make Your Decision",
      description: "Decide with confidence after living in the home. No surprises, no regrets.",
    },
  ]

  const sellerSteps = [
    {
      icon: Upload,
      title: "Create Account & Verify",
      description:
        "Sign up and verify ownership with your property tax statement and Zillow home dashboard screenshot.",
    },
    {
      icon: Home,
      title: "List Your Property",
      description: "Add photos, details, pricing, and set your availability calendar. Link to your sale listing.",
    },
    {
      icon: DollarSign,
      title: "Earn While You Wait",
      description:
        "Offset carrying costs and staging fees by earning 2-3x typical rental rates while your home is on the market.",
    },
    {
      icon: CheckCircle,
      title: "Connect with Serious Buyers",
      description: "Host pre-qualified buyers who are genuinely interested in purchasing your home.",
    },
  ]

  const steps = activeTab === "buyer" ? buyerSteps : sellerSteps

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-balance">How TryCrib Works</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
            Experience homes before you buy. Earn income while you sell.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="buyer" className="text-base">
              For Buyers
            </TabsTrigger>
            <TabsTrigger value="seller" className="text-base">
              For Sellers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buyer" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              {buyerSteps.map((step, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <step.icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="seller" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              {sellerSteps.map((step, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                        <step.icon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a
              href="/properties"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Browse Properties
            </a>
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
