import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AthleteAwardForm() {
  const [athletes, setAthletes] = useState([]);
  const [awards, setAwards] = useState([]);
  const [athleteAwards, setAthleteAwards] = useState([]);
  const [formData, setFormData] = useState({
    athlete_ID: '',
    award_ID: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAthletes();
    fetchAwards();
    fetchAthleteAwards();
  }, []);

  const fetchAthletes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/list/athletes');
      setAthletes(response.data.athletes);
    } catch (err) {
      console.error('Error fetching athletes:', err);
    }
  };

  const fetchAwards = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/list/awards');
      setAwards(response.data.awards);
    } catch (err) {
      console.error('Error fetching awards:', err);
    }
  };

  const fetchAthleteAwards = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/athlete-awards');
      setAthleteAwards(response.data.athleteAwards || []);
    } catch (err) {
      console.error('Error fetching athlete awards:', err);
      setAthleteAwards([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post('http://localhost:3001/api/athlete-awards', formData);
      const athlete = athletes.find(a => a.player_ID === parseInt(formData.athlete_ID));
      const award = awards.find(a => a.award_ID === parseInt(formData.award_ID));
      setSuccessMessage(`Successfully assigned ${award?.award_name} to ${athlete?.player_name}`);
      setFormData({
        athlete_ID: '',
        award_ID: ''
      });
      fetchAthleteAwards();
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Failed to assign award. Please check your selection.');
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Error assigning award:', err);
    } finally {
      setIsLoading(false);
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAthleteAwards = athleteAwards.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(athleteAwards.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Assign Award to Athlete</h2>
        <p className="mt-1 text-gray-600">Associate an award with an athlete.</p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="athlete_ID" className="block text-sm font-medium text-gray-700">
              Athlete
            </label>
            <select
              name="athlete_ID"
              id="athlete_ID"
              required
              value={formData.athlete_ID}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            >
              <option value="">Select an athlete</option>
              {athletes.map((athlete) => (
                <option key={athlete.player_ID} value={athlete.player_ID}>
                  {athlete.player_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="award_ID" className="block text-sm font-medium text-gray-700">
              Award
            </label>
            <select
              name="award_ID"
              id="award_ID"
              required
              value={formData.award_ID}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            >
              <option value="">Select an award</option>
              {awards.map((award) => (
                <option key={award.award_ID} value={award.award_ID}>
                  {award.award_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Assigning...' : 'Assign Award'}
          </button>
        </div>
      </form>

      {/* Existing Athlete Awards List */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900">Existing Athlete Awards</h3>
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Athlete</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Award</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentAthleteAwards.map((award) => (
                <tr key={`${award.athlete_ID}-${award.award_ID}`}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                    {athletes.find(a => a.player_ID === award.athlete_ID)?.player_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {awards.find(a => a.award_ID === award.award_ID)?.award_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add pagination controls */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, athleteAwards.length)}
                </span>{' '}
                of <span className="font-medium">{athleteAwards.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  Page {currentPage}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 