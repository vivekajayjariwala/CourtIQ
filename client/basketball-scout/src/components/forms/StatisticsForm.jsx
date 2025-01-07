import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StatisticsForm() {
  const [athletes, setAthletes] = useState([]);
  const [games, setGames] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [formData, setFormData] = useState({
    player_ID: '',
    match_ID: '',
    minutes_played: '',
    field_goals_made: '',
    field_goals_attempted: '',
    three_point_goals_made: '',
    three_point_goals_attempted: '',
    free_throws_made: '',
    free_throws_attempted: '',
    total_rebounds: '',
    assists: '',
    steals: '',
    blocks: '',
    turnovers: '',
    fouls: '',
    points: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAthletes();
    fetchGames();
    fetchStatistics();
  }, []);

  const fetchAthletes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/list/athletes');
      setAthletes(response.data.athletes);
    } catch (err) {
      console.error('Error fetching athletes:', err);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/games');
      setGames(response.data.games || []);
    } catch (err) {
      console.error('Error fetching games:', err);
      setGames([]);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/statistics');
      if (response.data && Array.isArray(response.data)) {
        setStatistics(response.data);
      } else {
        console.error('Invalid statistics data format:', response.data);
        setStatistics([]);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setStatistics([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post('http://localhost:3001/api/statistics', formData);
      setFormData({
        player_ID: '',
        match_ID: '',
        minutes_played: '',
        field_goals_made: '',
        field_goals_attempted: '',
        three_point_goals_made: '',
        three_point_goals_attempted: '',
        free_throws_made: '',
        free_throws_attempted: '',
        total_rebounds: '',
        assists: '',
        steals: '',
        blocks: '',
        turnovers: '',
        fouls: '',
        points: ''
      });
      setSuccessMessage(`Successfully created statistics for ${getAthleteName(formData.player_ID)}`);
      fetchStatistics();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Error creating statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getAthleteName = (playerId) => {
    return athletes.find(athlete => athlete.player_ID === parseInt(playerId))?.player_name || 'Unknown Athlete';
  };

  const getGameDetails = (matchId) => {
    const game = games.find(game => game.match_ID === parseInt(matchId));
    if (!game) return 'Unknown Game';
    return `Game ${game.match_ID} (${new Date(game.date).toLocaleDateString()})`;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStatistics = statistics.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(statistics.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add Game Statistics</h2>
        <p className="mt-1 text-gray-600">Record player statistics for a game.</p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 p-4 rounded-md">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="player_ID" className="block text-sm font-medium text-gray-700">
              Player
            </label>
            <select
              name="player_ID"
              id="player_ID"
              required
              value={formData.player_ID}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            >
              <option value="">Select a player</option>
              {athletes.map((athlete) => (
                <option key={athlete.player_ID} value={athlete.player_ID}>
                  {athlete.player_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="match_ID" className="block text-sm font-medium text-gray-700">
              Game
            </label>
            <select
              name="match_ID"
              id="match_ID"
              required
              value={formData.match_ID}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            >
              <option value="">Select a game</option>
              {games.map((game) => (
                <option key={game.match_ID} value={game.match_ID}>
                  {`Game ${game.match_ID} (${new Date(game.date).toLocaleDateString()})`}
                </option>
              ))}
            </select>
          </div>

          {/* Statistics Input Fields */}
          {Object.entries({
            minutes_played: 'Minutes Played',
            field_goals_made: 'Field Goals Made',
            field_goals_attempted: 'Field Goals Attempted',
            three_point_goals_made: '3PT Made',
            three_point_goals_attempted: '3PT Attempted',
            free_throws_made: 'Free Throws Made',
            free_throws_attempted: 'Free Throws Attempted',
            total_rebounds: 'Total Rebounds',
            assists: 'Assists',
            steals: 'Steals',
            blocks: 'Blocks',
            turnovers: 'Turnovers',
            fouls: 'Fouls',
            points: 'Points'
          }).map(([key, label]) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type="number"
                name={key}
                id={key}
                min="0"
                required
                value={formData[key]}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Statistics'}
          </button>
        </div>
      </form>

      {/* Recent Statistics List */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900">Recent Statistics</h3>
        <div className="mt-4 overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Player</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Game</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">MIN</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">PTS</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">REB</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">AST</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">STL</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">BLK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentStatistics.map((stat) => (
                <tr key={`${stat.player_ID}-${stat.match_ID}`}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                    {getAthleteName(stat.player_ID)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {getGameDetails(stat.match_ID)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.minutes_played}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.points}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.total_rebounds}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.assists}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.steals}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{stat.blocks}</td>
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
                  {Math.min(indexOfLastItem, statistics.length)}
                </span>{' '}
                of <span className="font-medium">{statistics.length}</span> results
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