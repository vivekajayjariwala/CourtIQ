import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AthletesPage() {
  const [athletes, setAthletes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const athletesPerPage = 10; // Number of athletes per page

  const [notification, setNotification] = useState({ message: '', show: false });

  useEffect(() => {
    // Add debounce to search
    const delayDebounceFn = setTimeout(() => {
      fetchAthletes();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage]);

  const fetchAthletes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/athletes`, {
        params: {
          page: currentPage,
          limit: athletesPerPage,
          search: searchQuery
        }
      });
      setAthletes(response.data.athletes);
      setTotalPages(Math.ceil(response.data.total / athletesPerPage));
    } catch (error) {
      console.error('Error fetching athletes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Search handler
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDelete = async (playerId) => {
    if (window.confirm('Are you sure you want to delete this athlete?')) {
      try {
        await axios.delete(`http://localhost:3001/api/athletes/${playerId}`);
        await fetchAthletes(); // Refresh the list
      } catch (error) {
        console.error('Error deleting athlete:', error);
        setNotification({
          message: "Can't delete because this player is associated with existing statistics or other records",
          show: true
        });
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification({ message: '', show: false });
        }, 3000);
      }
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/api/athletes/${selectedAthlete.player_ID}`, selectedAthlete);
      await fetchAthletes(); // Refresh the list
      setIsEditModalOpen(false); // Close the modal
    } catch (error) {
      console.error('Error updating athlete:', error);
      alert('Error updating athlete. Please try again.');
    }
  };

  return (
    <div className="bg-white">
      <div className="relative isolate px-8 pt-8 lg:px-10">
        <div className="mx-auto max-w-7xl py-8 sm:py-12 lg:py-14">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Athletes Directory
            </h1>
            <p className="mt-4 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              View, search, and manage athlete profiles.
            </p>
            
            {notification.show && (
              <div className="mt-4 animate-fade-in-down">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{notification.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-12 mb-8">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search athletes by name, position, or hometown..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          )}

          {/* Athletes List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {athletes.map((athlete) => (
                <li key={athlete.player_ID} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xl font-medium text-gray-600">
                            {athlete.player_number}
                          </span>
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-gray-900">{athlete.player_name}</h2>
                          <div className="flex space-x-4 text-sm text-gray-500">
                            <p>{athlete.player_position}</p>
                            <p>•</p>
                            <p>{athlete.height} ft</p>
                            <p>•</p>
                            <p>{athlete.weight} lbs</p>
                            <p>•</p>
                            <p>Year {athlete.player_year}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedAthlete(athlete);
                          setIsEditModalOpen(true);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(athlete.player_ID)}
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
                <h2 className="text-2xl font-bold mb-4">Edit Athlete</h2>
                <form onSubmit={handleEdit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={selectedAthlete?.player_name || ''}
                        onChange={(e) => setSelectedAthlete({...selectedAthlete, player_name: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Number</label>
                      <input
                        type="number"
                        value={selectedAthlete?.player_number || ''}
                        onChange={(e) => setSelectedAthlete({...selectedAthlete, player_number: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Height (ft)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedAthlete?.height || ''}
                        onChange={(e) => setSelectedAthlete({...selectedAthlete, height: parseFloat(e.target.value)})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight (lbs)</label>
                      <input
                        type="number"
                        value={selectedAthlete?.weight || ''}
                        onChange={(e) => setSelectedAthlete({...selectedAthlete, weight: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Position</label>
                      <input
                        type="text"
                        value={selectedAthlete?.player_position || ''}
                        onChange={(e) => setSelectedAthlete({...selectedAthlete, player_position: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={selectedAthlete?.player_year || ''}
                        onChange={(e) => setSelectedAthlete({...selectedAthlete, player_year: parseInt(e.target.value)})}
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