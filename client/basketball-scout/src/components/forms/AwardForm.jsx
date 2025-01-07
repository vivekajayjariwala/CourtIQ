import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AwardForm() {
  const [awards, setAwards] = useState([]);
  const [formData, setFormData] = useState({
    award_name: '',
    officiating_body: '',
    award_date: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/list/awards');
      setAwards(response.data.awards.map(award => ({
        ...award,
        award_date: award.award_date ? new Date(award.award_date).toISOString().split('T')[0] : ''
      })));
    } catch (err) {
      setError('Failed to fetch awards');
      console.error('Error fetching awards:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post('http://localhost:3001/api/awards', formData);
      setFormData({
        award_name: '',
        officiating_body: '',
        award_date: ''
      });
      setSuccessMessage(`Successfully created award: ${formData.award_name}`);
      fetchAwards();
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Failed to create award. Please check all required fields.');
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Error creating award:', err);
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

  // Add pagination calculation
  const indexOfLastAward = currentPage * itemsPerPage;
  const indexOfFirstAward = indexOfLastAward - itemsPerPage;
  const currentAwards = awards.slice(indexOfFirstAward, indexOfLastAward);
  const totalPages = Math.ceil(awards.length / itemsPerPage);

  // Add pagination controls
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add New Award</h2>
        <p className="mt-1 text-gray-600">Create a new award record.</p>
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
            <label htmlFor="award_name" className="block text-sm font-medium text-gray-700">
              Award Name
            </label>
            <input
              type="text"
              name="award_name"
              id="award_name"
              required
              value={formData.award_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="officiating_body" className="block text-sm font-medium text-gray-700">
              Officiating Body
            </label>
            <input
              type="text"
              name="officiating_body"
              id="officiating_body"
              value={formData.officiating_body}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="award_date" className="block text-sm font-medium text-gray-700">
              Award Date
            </label>
            <input
              type="date"
              name="award_date"
              id="award_date"
              required
              value={formData.award_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Award'}
          </button>
        </div>
      </form>

      {/* Updated Awards List with Pagination */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900">Existing Awards</h3>
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Award Name</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Officiating Body</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentAwards.map((award) => (
                <tr key={award.award_ID}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">{award.award_name}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{award.officiating_body}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(award.award_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Matched exactly with AthletesPage */}
        <div className="mt-4 flex items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstAward + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastAward, awards.length)}
              </span>{' '}
              of <span className="font-medium">{awards.length}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <select
              value={currentPage}
              onChange={(e) => handlePageChange(Number(e.target.value))}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
            >
              {[...Array(totalPages)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 