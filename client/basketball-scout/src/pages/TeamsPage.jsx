import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const teamsPerPage = 10;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTeams();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage]);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/teams`, {
        params: {
          page: currentPage,
          limit: teamsPerPage,
          search: searchQuery
        }
      });
      setTeams(response.data.teams);
      setTotalPages(Math.ceil(response.data.total / teamsPerPage));
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await axios.delete(`http://localhost:3001/api/teams/${teamId}`);
        await fetchTeams();
      } catch (error) {
        console.error('Error deleting team:', error);
        alert('Error deleting team. Please try again.');
      }
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/api/teams/${selectedTeam.team_ID}`, selectedTeam);
      await fetchTeams();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Error updating team. Please try again.');
    }
  };

  return (
    <div className="bg-white">
      <div className="relative isolate px-8 pt-8 lg:px-10">
        <div className="mx-auto max-w-7xl py-8 sm:py-12 lg:py-14">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Teams Directory
            </h1>
            <p className="mt-4 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              View, search, and manage team profiles.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-12 mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search teams by name, league, or location..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          )}

          {/* Teams List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {teams.map((team) => (
                <li key={team.team_ID} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">{team.team_name}</h2>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span>{team.league}</span>
                        <span className="mx-2">•</span>
                        <span>{team.location}</span>
                        <span className="mx-2">•</span>
                        <span>Record: {team.wins}-{team.losses}</span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedTeam(team);
                          setIsEditModalOpen(true);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(team.team_ID)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>

                <select
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="block w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  {[...Array(totalPages)].map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Edit Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
                <h2 className="text-2xl font-bold mb-4">Edit Team</h2>
                <form onSubmit={handleEdit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Team Name</label>
                      <input
                        type="text"
                        value={selectedTeam?.team_name || ''}
                        onChange={(e) => setSelectedTeam({...selectedTeam, team_name: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">League</label>
                      <input
                        type="text"
                        value={selectedTeam?.league || ''}
                        onChange={(e) => setSelectedTeam({...selectedTeam, league: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Wins</label>
                      <input
                        type="number"
                        value={selectedTeam?.wins || 0}
                        onChange={(e) => setSelectedTeam({...selectedTeam, wins: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Losses</label>
                      <input
                        type="number"
                        value={selectedTeam?.losses || 0}
                        onChange={(e) => setSelectedTeam({...selectedTeam, losses: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Standing</label>
                      <input
                        type="number"
                        value={selectedTeam?.standing || ''}
                        onChange={(e) => setSelectedTeam({...selectedTeam, standing: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        value={selectedTeam?.location || ''}
                        onChange={(e) => setSelectedTeam({...selectedTeam, location: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 text-white rounded-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 