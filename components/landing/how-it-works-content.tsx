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
        "Log in to explore homes. If you don't find the home you're looking for, submit a request for it to be added.",
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
      icon: Home,
      title: "List Your Property",
      description: "We help facilitate this through your listing agent.",
    },
    {
      icon: DollarSign,
      title: "Earn While You Wait",
      description:
        "Offset carrying costs, staging fees, utility expenses and more by earning 2-3x typical rental rates while your home is on the market.",
    },
    {
      icon: CheckCircle,
      title: "Connect with Serious Buyers",
      description: "Host pre-qualified buyers who are genuinely interested in purchasing your home.",
    },
  ]

  const steps = activeTab === "buyer" ? buyerSteps : sellerSteps

  return (
    <section id="how-it-works" className="bg-white pt-8 pb-16 sm:pt-8 sm:pb-24 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-balance">How TryCrib Works</h1>
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
            <div className="grid gap-6 md:grid-cols-3">
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
            <div className="grid gap-6 md:grid-cols-3">
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

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            *Listings are based on public MLS data. Requests are routed through real estate agents.
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            {/* Hidden: Browse Properties button */}
            {/* <a
              href="/properties"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Browse Properties
            </a> */}
            <a
              href="/auth?tab=signup"
              className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Get Started
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
