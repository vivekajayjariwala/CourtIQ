import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnalyticsPage() {
  // State for filters
  const [gameDate, setGameDate] = useState('');
  const [minWinRatio, setMinWinRatio] = useState('');
  const [minGamesPlayed, setMinGamesPlayed] = useState('');
  const [awardType, setAwardType] = useState('');
  const [minInjuryDays, setMinInjuryDays] = useState('');
  const [minTeamPoints, setMinTeamPoints] = useState('');

  // State for data
  const [topScorers, setTopScorers] = useState([]);
  const [teamRatios, setTeamRatios] = useState([]);
  const [highestScoringTeams, setHighestScoringTeams] = useState([]);
  const [awardWinners, setAwardWinners] = useState([]);
  const [injuredPlayers, setInjuredPlayers] = useState([]);
  const [teamAverages, setTeamAverages] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    scorers: false,
    ratios: false,
    scoring: false,
    awards: false,
    injuries: false,
    averages: false
  });

  // Error states
  const [error, setError] = useState({
    scorers: null,
    ratios: null,
    scoring: null,
    awards: null,
    injuries: null,
    averages: null
  });

  // API base URL
  const API_BASE_URL = 'http://localhost:3001/api';

  // Add new state for award types
  const [awardTypes, setAwardTypes] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchTopScorers();
    fetchTeamRatios();
    fetchHighestScoringTeams();
    fetchAwardWinners();
    fetchInjuredPlayers();
    fetchTeamAverages();
  }, []);

  // Add new useEffect to fetch award types
  useEffect(() => {
    const fetchAwardTypes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/list/awards`);
        // Extract unique award names
        const uniqueAwards = [...new Set(response.data.awards.map(award => award.award_name))];
        setAwardTypes(uniqueAwards);
      } catch (err) {
        console.error('Error fetching award types:', err);
      }
    };
    
    fetchAwardTypes();
  }, []);

  // API fetch functions
  const fetchTopScorers = async (date = '') => {
    setLoading(prev => ({ ...prev, scorers: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/top-scorers`, {
        params: { date }
      });
      setTopScorers(response.data.topScorers);
      setError(prev => ({ ...prev, scorers: null }));
    } catch (err) {
      setError(prev => ({ ...prev, scorers: 'Error fetching top scorers' }));
    } finally {
      setLoading(prev => ({ ...prev, scorers: false }));
    }
  };

  const fetchTeamRatios = async (minRatio = 0) => {
    setLoading(prev => ({ ...prev, ratios: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/team-ratios`, {
        params: { minRatio }
      });
      setTeamRatios(response.data.teamRatios);
      setError(prev => ({ ...prev, ratios: null }));
    } catch (err) {
      setError(prev => ({ ...prev, ratios: 'Error fetching team ratios' }));
    } finally {
      setLoading(prev => ({ ...prev, ratios: false }));
    }
  };

  const fetchHighestScoringTeams = async (minGames = 0) => {
    setLoading(prev => ({ ...prev, scoring: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/highest-scoring`, {
        params: { minGames }
      });
      console.log('Highest scoring teams response:', response.data);
      setHighestScoringTeams(response.data.highestScoringTeams);
      setError(prev => ({ ...prev, scoring: null }));
    } catch (err) {
      console.error('Error fetching highest scoring teams:', err);
      setError(prev => ({ ...prev, scoring: 'Error fetching highest scoring teams' }));
    } finally {
      setLoading(prev => ({ ...prev, scoring: false }));
    }
  };

  const fetchAwardWinners = async (type = '') => {
    setLoading(prev => ({ ...prev, awards: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/award-winners`, {
        params: { type }
      });
      setAwardWinners(response.data.awardWinners);
      setError(prev => ({ ...prev, awards: null }));
    } catch (err) {
      setError(prev => ({ ...prev, awards: 'Error fetching award winners' }));
    } finally {
      setLoading(prev => ({ ...prev, awards: false }));
    }
  };

  const fetchInjuredPlayers = async (minDays = 0) => {
    setLoading(prev => ({ ...prev, injuries: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/injured-players`, {
        params: { minDays }
      });
      console.log('Injured players response:', response.data);
      setInjuredPlayers(response.data.injuredPlayers);
      setError(prev => ({ ...prev, injuries: null }));
    } catch (err) {
      console.error('Error fetching injured players:', err);
      setError(prev => ({ ...prev, injuries: 'Error fetching injured players' }));
    } finally {
      setLoading(prev => ({ ...prev, injuries: false }));
    }
  };

  const fetchTeamAverages = async (minPoints = 0) => {
    setLoading(prev => ({ ...prev, averages: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/team-averages`, {
        params: { minPoints }
      });
      setTeamAverages(response.data.teamAverages);
      setError(prev => ({ ...prev, averages: null }));
    } catch (err) {
      setError(prev => ({ ...prev, averages: 'Error fetching team averages' }));
    } finally {
      setLoading(prev => ({ ...prev, averages: false }));
    }
  };

  // Handle search functions
  const handleSearch = (section, filterValue) => {
    switch (section) {
      case 'topScorers':
        fetchTopScorers(gameDate);
        break;
      case 'winRatio':
        fetchTeamRatios(minWinRatio);
        break;
      case 'highScoring':
        fetchHighestScoringTeams(minGamesPlayed);
        break;
      case 'awards':
        fetchAwardWinners(awardType);
        break;
      case 'injuries':
        fetchInjuredPlayers(minInjuryDays);
        break;
      case 'teamAverages':
        fetchTeamAverages(minTeamPoints);
        break;
      default:
        console.error('Unknown section:', section);
    }
  };

  return (
    <div className="bg-white">
      <div className="relative isolate px-8 pt-8 lg:px-10">
        <div className="mx-auto max-w-7xl py-8 sm:py-12 lg:py-14">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Basketball Analytics Hub
            </h1>
            <p className="mt-4 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              Comprehensive analytics and insights for basketball performance metrics.
            </p>
          </div>

          {/* Top Scorers Section with Filter */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Game High Scorers</h2>
            <p className="mt-2 text-gray-600">Track the highest-scoring performances in individual games.</p>
            <div className="mt-4 flex gap-4">
              <input
                type="date"
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500"
              />
              <button
                onClick={() => handleSearch('topScorers', gameDate)}
                className="whitespace-nowrap bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-500"
              >
                Filter by Date
              </button>
            </div>
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topScorers.map((scorer) => (
                    <tr key={scorer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{scorer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scorer.points}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scorer.game}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scorer.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Win-Loss Ratios with Filter */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Team Win-Loss Ratios</h2>
            <p className="mt-2 text-gray-600">Compare team performance based on win-loss percentages.</p>
            <div className="mt-4 flex gap-4">
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                placeholder="Minimum win ratio (e.g., 0.6)"
                value={minWinRatio}
                onChange={(e) => setMinWinRatio(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500"
              />
              <button
                onClick={() => handleSearch('winRatio', minWinRatio)}
                className="whitespace-nowrap bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-500"
              >
                Filter Teams
              </button>
            </div>
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wins</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Losses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ratio</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamRatios.map((team) => (
                    <tr key={team.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.wins}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.losses}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.ratio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Highest Scoring Teams with Filter */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Highest Scoring Teams</h2>
            <p className="mt-2 text-gray-600">Teams ranked by total points scored across all games.</p>
            <div className="mt-4 flex gap-4">
              <input
                type="number"
                placeholder="Minimum games played"
                value={minGamesPlayed}
                onChange={(e) => setMinGamesPlayed(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500"
              />
              <button
                onClick={() => handleSearch('highScoring', minGamesPlayed)}
                className="whitespace-nowrap bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-500"
              >
                Filter by Games
              </button>
            </div>
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Games Played</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {highestScoringTeams.map((team) => (
                    <tr key={team.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.totalScore}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.gamesPlayed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Award Winners with Filter */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Award Recipients</h2>
            <p className="mt-2 text-gray-600">Track athletes who have received notable awards and recognition.</p>
            <div className="mt-4 flex gap-4">
              <select
                value={awardType}
                onChange={(e) => setAwardType(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="">All Awards</option>
                {awardTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button
                onClick={() => handleSearch('awards', awardType)}
                className="whitespace-nowrap bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-500"
              >
                Filter Awards
              </button>
            </div>
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Award</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {awardWinners.map((winner) => (
                    <tr key={winner.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{winner.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{winner.award}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{winner.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Injured Players with Filter */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Extended Injuries Report</h2>
            <p className="mt-2 text-gray-600">Players who have been sidelined due to injuries for an extended period.</p>
            <div className="mt-4 flex gap-4">
              <input
                type="number"
                placeholder="Minimum days injured"
                value={minInjuryDays}
                onChange={(e) => setMinInjuryDays(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500"
              />
              <button
                onClick={() => handleSearch('injuries', minInjuryDays)}
                className="whitespace-nowrap bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-500"
              >
                Filter by Duration
              </button>
            </div>
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Injury</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Out</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {injuredPlayers.map((player) => (
                    <tr key={player.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.injury}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.daysOut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Scoring Averages with Filter */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900">Team Scoring Averages</h2>
            <p className="mt-2 text-gray-600">Average points scored per game by each team.</p>
            <div className="mt-4 flex gap-4">
              <input
                type="number"
                placeholder="Minimum average points"
                value={minTeamPoints}
                onChange={(e) => setMinTeamPoints(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500"
              />
              <button
                onClick={() => handleSearch('teamAverages', minTeamPoints)}
                className="whitespace-nowrap bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-500"
              >
                Filter by Points
              </button>
            </div>
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Points</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamAverages.map((team) => (
                    <tr key={team.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.team}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.avgPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 