export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#1a1f2e] py-12">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Reduce purchase anxiety in 3 steps</h2>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {/* Step 1 */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
              <span className="text-lg font-bold text-white">1</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Browse Properties</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Search for homes currently on the market that you're interested in purchasing.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
              <span className="text-lg font-bold text-white">2</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Request & Stay</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Request a short-term stay to experience living in the home before making an offer.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
              <span className="text-lg font-bold text-white">3</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Make an Informed Decision</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Decide with confidence after experiencing the home, neighborhood, and commute.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
