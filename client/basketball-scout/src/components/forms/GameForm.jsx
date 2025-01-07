import { useState, useEffect } from 'react';
import axios from 'axios';

export default function GameForm() {
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [formData, setFormData] = useState({
    home_team_ID: '',
    away_team_ID: '',
    home_team_score: '',
    away_team_score: '',
    date: '',
    league: '',
    match_type: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchTeams();
    fetchGames();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/list/teams');
      setTeams(response.data.teams);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/games');
      setGames(response.data.games || []);
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validate that home and away teams are different
    if (formData.home_team_ID === formData.away_team_ID) {
      setError('Home and away teams must be different');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/games', formData);
      const homeTeam = teams.find(t => t.team_ID === parseInt(formData.home_team_ID));
      const awayTeam = teams.find(t => t.team_ID === parseInt(formData.away_team_ID));
      setSuccessMessage(`Successfully created game: ${homeTeam?.team_name} vs ${awayTeam?.team_name}`);
      setFormData({
        home_team_ID: '',
        away_team_ID: '',
        home_team_score: '',
        away_team_score: '',
        date: '',
        league: '',
        match_type: ''
      });
      fetchGames();
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Failed to create game. Please check all required fields.');
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Error creating game:', err);
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

  const getTeamName = (teamId) => {
    const team = teams.find(team => team.team_ID === parseInt(teamId));
    return team ? team.team_name : 'Unknown Team';
  };

  // Add pagination calculation
  const indexOfLastGame = currentPage * itemsPerPage;
  const indexOfFirstGame = indexOfLastGame - itemsPerPage;
  const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(games.length / itemsPerPage);

  // Add pagination controls
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add New Game</h2>
        <p className="mt-1 text-gray-600">Record a new game result.</p>
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
            <label htmlFor="home_team_ID" className="block text-sm font-medium text-gray-700">
              Home Team
            </label>
            <select
              name="home_team_ID"
              id="home_team_ID"
              required
              value={formData.home_team_ID}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            >
              <option value="">Select home team</option>
              {teams.map((team) => (
                <option key={`home-${team.team_ID}`} value={team.team_ID}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="away_team_ID" className="block text-sm font-medium text-gray-700">
              Away Team
            </label>
            <select
              name="away_team_ID"
              id="away_team_ID"
              required
              value={formData.away_team_ID}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            >
              <option value="">Select away team</option>
              {teams.map((team) => (
                <option key={`away-${team.team_ID}`} value={team.team_ID}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="home_team_score" className="block text-sm font-medium text-gray-700">
              Home Team Score
            </label>
            <input
              type="number"
              name="home_team_score"
              id="home_team_score"
              required
              min="0"
              value={formData.home_team_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="away_team_score" className="block text-sm font-medium text-gray-700">
              Away Team Score
            </label>
            <input
              type="number"
              name="away_team_score"
              id="away_team_score"
              required
              min="0"
              value={formData.away_team_score}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Game Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="league" className="block text-sm font-medium text-gray-700">
              League
            </label>
            <input
              type="text"
              name="league"
              id="league"
              required
              value={formData.league}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="match_type" className="block text-sm font-medium text-gray-700">
              Match Type
            </label>
            <select
              name="match_type"
              id="match_type"
              required
              value={formData.match_type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            >
              <option value="">Select match type</option>
              <option value="Regular Season">Regular Season</option>
              <option value="Playoff">Playoff</option>
              <option value="Championship">Championship</option>
              <option value="Exhibition">Exhibition</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Game Record'}
          </button>
        </div>
      </form>

      {/* Updated Games List with Pagination */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900">Recent Games</h3>
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Teams</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">League</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentGames.map((game) => (
                <tr key={game.match_ID}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                    {new Date(game.date).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {getTeamName(game.home_team_ID)} vs {getTeamName(game.away_team_ID)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {game.home_team_score} - {game.away_team_score}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{game.league}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{game.match_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls - Matched exactly with AthletesPage */}
        <div className="mt-4 flex items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstGame + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastGame, games.length)}
              </span>{' '}
              of <span className="font-medium">{games.length}</span> results
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