import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AthleteForm() {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    player_name: '',
    player_number: '',
    height: '',
    weight: '',
    age: '',
    player_position: '',
    player_year: '',
    hometown: '',
    highschool: '',
    team_ID: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/list/teams');
      if (response.data && response.data.teams) {
        setTeams(response.data.teams);
      } else {
        console.error('Unexpected teams data format:', response.data);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post('http://localhost:3001/api/athletes', formData);
      setFormData({
        player_name: '',
        player_number: '',
        height: '',
        weight: '',
        age: '',
        player_position: '',
        player_year: '',
        hometown: '',
        highschool: '',
        team_ID: ''
      });
      setSuccessMessage(`Successfully created athlete: ${formData.player_name}`);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Failed to create athlete. Please check all required fields.');
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Error creating athlete:', err);
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add New Athlete</h2>
        <p className="mt-1 text-gray-600">Create a new athlete record.</p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
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
            <label htmlFor="player_name" className="block text-sm font-medium text-gray-700">
              Player Name
            </label>
            <input
              type="text"
              name="player_name"
              id="player_name"
              required
              value={formData.player_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="player_number" className="block text-sm font-medium text-gray-700">
              Jersey Number
            </label>
            <input
              type="number"
              name="player_number"
              id="player_number"
              min="0"
              value={formData.player_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700">
              Height (inches)
            </label>
            <input
              type="number"
              name="height"
              id="height"
              step="0.1"
              min="0"
              value={formData.height}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Weight (lbs)
            </label>
            <input
              type="number"
              name="weight"
              id="weight"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              type="number"
              name="age"
              id="age"
              min="0"
              value={formData.age}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="player_position" className="block text-sm font-medium text-gray-700">
              Position
            </label>
            <select
              name="player_position"
              id="player_position"
              value={formData.player_position}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            >
              <option value="">Select position</option>
              <option value="Point Guard">Point Guard</option>
              <option value="Shooting Guard">Shooting Guard</option>
              <option value="Small Forward">Small Forward</option>
              <option value="Power Forward">Power Forward</option>
              <option value="Center">Center</option>
            </select>
          </div>

          <div>
            <label htmlFor="player_year" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <input
              type="number"
              name="player_year"
              id="player_year"
              min="1"
              max="5"
              value={formData.player_year}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="hometown" className="block text-sm font-medium text-gray-700">
              Hometown
            </label>
            <input
              type="text"
              name="hometown"
              id="hometown"
              value={formData.hometown}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="highschool" className="block text-sm font-medium text-gray-700">
              High School
            </label>
            <input
              type="text"
              name="highschool"
              id="highschool"
              value={formData.highschool}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            />
          </div>

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
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.team_ID} value={team.team_ID}>
                  {team.team_name}
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
            {isLoading ? 'Creating...' : 'Create Athlete'}
          </button>
        </div>
      </form>
    </div>
  );
} 