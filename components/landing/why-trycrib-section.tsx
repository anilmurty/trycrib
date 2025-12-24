import { Home, TrendingUp, User } from "lucide-react"

export function WhyTryCribSection() {
  const benefits = [
    {
      icon: Home,
      title: "Buyers",
      description: "Eliminate the biggest financial risk of your life by experiencing a home's true character before you make an offer.",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: TrendingUp,
      title: "Sellers",
      description: "Attract committed buyers and earn income during the listing period to offset carrying costs like staging, property taxes, utilities, and interest payments.",
      iconColor: "text-[#059669]",
      bgColor: "bg-green-50"
    },
    {
      icon: User,
      title: "Agents",
      description: "Offer a powerful marketing tool that makes your listings stand out and attract serious buyers. Convert hesitant buyers into confident ones with shorter sales cycles and stronger offers.",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      isDualIcon: true
    }
  ]

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why use TryCrib?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-lg ${benefit.bgColor} flex items-center justify-center relative`}>
                      {benefit.isDualIcon ? (
                        <>
                          <User className="h-6 w-6 text-blue-600 absolute left-1" />
                          <User className="h-6 w-6 text-[#059669] absolute right-1" />
                        </>
                      ) : (
                        <Icon className={`h-6 w-6 ${benefit.iconColor}`} />
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-base text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
