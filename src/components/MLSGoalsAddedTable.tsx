import { useState, useEffect } from 'react';
import { useGetTeamsQuery, useGetPlayersQuery, useGetGoalsAddedQuery } from '../features/mlsApiSlice';
import LeagueGoalsAddedTable from './LeagueGoalsAddedTable';

export default function MLSGoalsAddedTable() {
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [years] = useState<string[]>(['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013']);

  // RTK Query hooks
  const { data: teams = [], isLoading: isLoadingTeams } = useGetTeamsQuery();
  const { data: players = [], isLoading: isLoadingPlayers } = useGetPlayersQuery();
  const { data: goalsAdded = [], isLoading: isLoadingGoalsAdded } = useGetGoalsAddedQuery({
    season_name: selectedYear,
  });

  return (
    <LeagueGoalsAddedTable
      leagueName="MLS"
      teams={teams}
      players={players}
      goalsAdded={goalsAdded}
      isLoadingTeams={isLoadingTeams}
      isLoadingPlayers={isLoadingPlayers}
      isLoadingGoalsAdded={isLoadingGoalsAdded}
      years={years}
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
    />
  );
} 