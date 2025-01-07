import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            {/* Logo/Home */}
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-orange-600">CourtIQ</span>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center space-x-4">
            <Link to="/athletes" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-base font-medium">
              Athletes
            </Link>
            <Link to="/teams" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-base font-medium">
              Teams
            </Link>
            <Link to="/analytics" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-base font-medium">
              Analytics
            </Link>

            <Link to="/manage" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-base font-medium">
              Management
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 