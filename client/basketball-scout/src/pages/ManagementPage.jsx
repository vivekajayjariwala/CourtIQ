import { useState } from 'react';
import AthleteForm from '../components/forms/AthleteForm';
import TeamForm from '../components/forms/TeamForm';
import StatisticsForm from '../components/forms/StatisticsForm';
import AwardForm from '../components/forms/AwardForm';
import TeamAwardForm from '../components/forms/TeamAwardForm';
import AthleteAwardForm from '../components/forms/AthleteAwardForm';
import GameForm from '../components/forms/GameForm';

export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState('athletes');

  const tabs = [
    { id: 'athletes', label: 'Athletes' },
    { id: 'teams', label: 'Teams' },
    { id: 'games', label: 'Games' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'awards', label: 'Awards' },
    { id: 'teamAwards', label: 'Team Awards' },
    { id: 'athleteAwards', label: 'Athlete Awards' },
  ];

  return (
    <div className="bg-white">
      <div className="relative isolate px-8 pt-8 lg:px-10">
        <div className="mx-auto max-w-7xl py-8 sm:py-12 lg:py-14">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Data Management Center
            </h1>
            <p className="mt-4 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              Add athlete profiles, team information, and game statistics.
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-12 border-b border-gray-200">
            <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                    ${activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Form Content */}
          <div className="mt-8">
            {activeTab === 'athletes' && <AthleteForm />}
            {activeTab === 'teams' && <TeamForm />}
            {activeTab === 'games' && <GameForm />}
            {activeTab === 'statistics' && <StatisticsForm />}
            {activeTab === 'awards' && <AwardForm />}
            {activeTab === 'teamAwards' && <TeamAwardForm />}
            {activeTab === 'athleteAwards' && <AthleteAwardForm />}
          </div>
        </div>
      </div>
    </div>
  );
} 