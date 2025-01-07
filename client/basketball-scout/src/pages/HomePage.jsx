import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-8 pt-16 lg:px-10">
        <div className="mx-auto max-w-4xl py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
              Discover Tomorrow's Basketball Stars Today
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              Your all-in-one platform for evaluating and tracking NCAA basketball talent. Streamline your scouting process and never miss the next rising college star.
            </p>
            <div className="mt-12 flex items-center justify-center gap-x-6">
              <Link
                to="/athletes"
                className="rounded-md bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              >
                Start Scouting
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 