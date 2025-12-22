"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Home, Search, Calendar, CheckCircle, Upload, DollarSign, ChevronDown, ChevronUp } from "lucide-react"

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

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "What is TryCrib?",
      answer: "TryCrib is a service that helps prospective buyers and sellers of homes.\n\nFor buyers it provides a way to experience living in the home for a short duration of time that is longer than a typical showing. This helps reduce the stress of unknowns like not knowing how the sun comes through at different times of day, what's the commute like, what are the sights and sounds, possibly getting to experience the neighborhood etc.\n\nFor sellers, TryCrib provides a way to offset some or all the costs of keeping a home listed, including staging, cleaning, utility bills, taxes and more. In addition, it also makes their home more attractive to prospective buyers particularly during a period of slow and length sales cycles and increasingly longer days to sale.\n\nFor real estate agents, TryCrib provides a way to shorten the sales cycle by providing additional value to both types of clients."
    },
    {
      question: "Can anyone request stays at TryCrib?",
      answer: "In order to request stays at TryCrib a buyer must have a loan preapproval that qualifies them to financially be able to purchase the home they are requesting a stay at, if things work out. They should also be working with a licensed real estate agent (aka buyers agent)."
    },
    {
      question: "How do stay requests get processed?",
      answer: "All stay requests are routed through the buyer's real estate agent, who then schedules a time that works for both parties, if necessary by coordinating with the seller's agent (who communicates with the seller) to figure out scheduling."
    },
    {
      question: "How does one list their home?",
      answer: "The platform is seeded with a relatively small set of listings that are based on publicly available MLS data. Seller's looking to list their home may search for their home and initiate a request from there or alternatively indicate their address if the home isn't already on the platform. The request will be routed to the seller's agent, who will edit the listing, set a nightly price and set up a schedule. The platform provides a way for seller's and agents to collaborate on listings and once things look good, the listing is published which makes it available for buyers to request stays."
    },
    {
      question: "How much do stays cost?",
      answer: "The stay cost is decided by the Seller (working with their agent) and depends on the home. Generally speaking, the more expensive the home, the higher the per night cost. \n\n TryCrib homes generally list for 2-3x the price of a comparable home listed on short-term rental platforms."
    },
    {
      question: "Is there a platform fee or subscription cost?",
      answer: "Initially the service is offered at no cost (meaning there is no additional cost, above and beyond what the seller charges and all payments are passed through to the seller). Over time, there may be a small service charge added to offset the cost of running the platform but when that happenens any stays created before the change will not incur the additional charge."
    },
    {
      question: "How is this any different from a short-term rental service?",
      answer: "Unlike a short term rental service that let's anyone request a stay, TryCrib is exclusively focused on home buyers. It does this by ensuring they are serious about purchasing a home in the area and have the means to do so. Further, TryCrib ensures all communications between the two parties are routed through their agents, thereby adhereing to the standard home buying process."
    }
  ]

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

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
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Get Started
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-base text-gray-600">
              Have additional questions? Just drop us a note at{" "}
              <a href="mailto:hello@trycrib.com" className="text-blue-600 hover:text-blue-700 underline">
                hello@trycrib.com
              </a>
              .
            </p>
          </div>

          <div className="space-y-0 border-t border-gray-200">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between py-5 px-0 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="text-base font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 cursor-pointer">
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </button>
                {expandedFaq === index && (
                  <div className="pb-5 px-0">
                    <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
