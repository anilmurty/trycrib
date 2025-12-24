"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export function FAQSection() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "What is TryCrib?",
      answer: "TryCrib is a service that helps prospective buyers and sellers of homes.\n\nFor buyers it provides a way to experience living in the home for a short duration of time that is longer than a typical showing. This helps reduce the stress of unknowns like not knowing how the sun comes through at different times of day, what's the commute like, what are the sights and sounds, possibly getting to experience the neighborhood etc.\n\nFor sellers, TryCrib provides a way to offset some or all the costs of keeping a home listed, including staging, cleaning, utility bills, taxes and more. In addition, it also makes their home more attractive to prospective buyers particularly during a period of slow and length sales cycles and increasingly longer days to sale.\n\nFor real estate agents, TryCrib provides a way to shorten the sales cycle by providing additional value to both types of clients."
    },
    {
      question: "Why do we need this?",
      answer: "Well, why not! - think about it, nearly everything in life comes with some sort of trial. Whether it be clothes and shoes or a car. You get to \"test drive\" them. In fact, most people experience what it will be like to live with someone before they decide to \"tie the knot\". But for some reason, one of the most expensive purchases for most people does not come with any sort of trial. Why is that?"
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
      question: "How long are typical stays?",
      answer: "A stay is typically for a portion of a day (6-12 hours) or one night. The intention is not to be a vacation rental but rather allow the buyers to experience the home for a longer duration than a typical showing allows for."
    },
    {
      question: "How does one list their home?",
      answer: "The platform is seeded with a relatively small set of listings that are based on publicly available MLS data. Seller's looking to list their home may search for their home and initiate a request from there or alternatively indicate their address if the home isn't already on the platform. The request will be routed to the seller's agent, who will edit the listing, set a nightly price and set up a schedule. The platform provides a way for seller's and agents to collaborate on listings and once things look good, the listing is published which makes it available for buyers to request stays."
    },
    {
      question: "How much do stays cost?",
      answer: "The stay cost is decided by the Seller (working with their agent) and depends on the home. Generally speaking, the more expensive the home, the higher the per night cost. \n\n TryCrib homes generally list for 2-3x the price of a comparable home listed on short-term rental platforms. This, along with buyer qualifications implies that only the most serious buyers generally make stay requests."
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
    <section className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg py-8 px-6 sm:px-8 shadow-sm">
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
