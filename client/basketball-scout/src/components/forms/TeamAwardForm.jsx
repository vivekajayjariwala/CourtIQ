import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TeamAwardForm() {
  const [teams, setTeams] = useState([]);
  const [awards, setAwards] = useState([]);
  const [teamAwards, setTeamAwards] = useState([]);
  const [formData, setFormData] = useState({
    team_ID: '',
    award_ID: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeamAwards = teamAwards.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(teamAwards.length / itemsPerPage);

  useEffect(() => {
    fetchTeams();
    fetchAwards();
    fetchTeamAwards();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/list/teams');
      setTeams(response.data.teams);
    } catch (err) {
      console.error('Error fetching teams:', err);
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

  const fetchTeamAwards = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/team-awards');
      setTeamAwards(response.data.teamAwards || []);
    } catch (err) {
      console.error('Error fetching team awards:', err);
      setTeamAwards([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post('http://localhost:3001/api/team-awards', formData);
      const team = teams.find(t => t.team_ID === parseInt(formData.team_ID));
      const award = awards.find(a => a.award_ID === parseInt(formData.award_ID));
      setSuccessMessage(`Successfully assigned ${award?.award_name} to ${team?.team_name}`);
      setFormData({
        team_ID: '',
        award_ID: ''
      });
      fetchTeamAwards();
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Assign Award to Team</h2>
        <p className="mt-1 text-gray-600">Associate an award with a team.</p>
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
            <label htmlFor="team_ID" className="block text-sm font-medium text-gray-700">
              Team
            </label>
            <select
              name="team_ID"
              id="team_ID"
              required
              value={formData.team_ID}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.team_ID} value={team.team_ID}>
                  {team.team_name}
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

      {/* Existing Team Awards List */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900">Existing Team Awards</h3>
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Team</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Award</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentTeamAwards.map((ta) => (
                <tr key={`${ta.team_ID}-${ta.award_ID}`}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                    {teams.find(t => t.team_ID === ta.team_ID)?.team_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {awards.find(a => a.award_ID === ta.award_ID)?.award_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                  {Math.min(indexOfLastItem, teamAwards.length)}
                </span>{' '}
                of <span className="font-medium">{teamAwards.length}</span> results
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