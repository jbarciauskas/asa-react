import { useState } from 'react';
import { useGetTeamsQuery, useGetPlayersQuery, useGetGoalsAddedQuery } from '../features/nwslApiSlice';
import LeagueGoalsAddedTable from './LeagueGoalsAddedTable';

export default function NWSLGoalsAddedTable() {
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [years] = useState<string[]>(['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016']);

  // RTK Query hooks
  const { data: teams = [], isLoading: isLoadingTeams } = useGetTeamsQuery();
  const { data: players = [], isLoading: isLoadingPlayers } = useGetPlayersQuery({});
  const { data: goalsAdded = [], isLoading: isLoadingGoalsAdded } = useGetGoalsAddedQuery({
    season_name: selectedYear,
  });

  return (
    <LeagueGoalsAddedTable
      leagueName="NWSL"
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