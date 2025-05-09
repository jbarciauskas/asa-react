import { useMemo, useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FormControl, InputLabel, Select, MenuItem, Box, TextField } from '@mui/material';
import { Player, Team, GoalsAddedPlayer } from '../api/types';
import { useGetTeamsQuery, useGetPlayersQuery, useGetGoalsAddedQuery } from '../features/asaApiSlice';

interface LeagueGoalsAddedTableProps {
  leagueName?: string;
  teams?: Team[];
  players?: Player[];
  goalsAdded?: GoalsAddedPlayer[];
  isLoadingTeams?: boolean;
  isLoadingPlayers?: boolean;
  isLoadingGoalsAdded?: boolean;
  years?: string[];
  selectedYear?: string;
  onYearChange?: (year: string) => void;
  league?: 'mls' | 'nwsl';
}

interface ActionData {
  action_type: string;
  goals_added_above_avg: number;
}

interface PlayerData {
  player_id: number;
  team_ids: Set<string>;
  data: ActionData[];
}

const BASE_COLUMNS: GridColDef[] = [
  { field: 'player_name', headerName: 'Player', width: 180 },
  { field: 'team_names', headerName: 'Teams', width: 200 },
  { field: 'goals_added_total', headerName: 'Goals Added (Total)', width: 180, type: 'number' },
];

export default function LeagueGoalsAddedTable(props: LeagueGoalsAddedTableProps) {
  // If league is provided, fetch data internally
  const [internalYear, setInternalYear] = useState('2025');
  const years = props.years ?? ['2025', '2024', '2023', '2022', '2021', '2020'];

  let teams = props.teams;
  let players = props.players;
  let goalsAdded = props.goalsAdded;
  let isLoadingTeams = props.isLoadingTeams;
  let isLoadingPlayers = props.isLoadingPlayers;
  let isLoadingGoalsAdded = props.isLoadingGoalsAdded;
  let leagueName = props.leagueName;
  let selectedYear = props.selectedYear ?? internalYear;
  let onYearChange = props.onYearChange ?? setInternalYear;

  // Always call all hooks
  const { data: mlsTeams, isLoading: mlsIsLoadingTeams } = useGetTeamsQuery({ league: 'mls' });
  const { data: mlsPlayers, isLoading: mlsIsLoadingPlayers } = useGetPlayersQuery({ league: 'mls' });
  const { data: mlsGoalsAdded, isLoading: mlsIsLoadingGoalsAdded } = useGetGoalsAddedQuery({ league: 'mls', season_name: selectedYear });

  const { data: nwslTeams, isLoading: nwslIsLoadingTeams } = useGetTeamsQuery({ league: 'nwsl' });
  const { data: nwslPlayers, isLoading: nwslIsLoadingPlayers } = useGetPlayersQuery({ league: 'nwsl' });
  const { data: nwslGoalsAdded, isLoading: nwslIsLoadingGoalsAdded } = useGetGoalsAddedQuery({ league: 'nwsl', season_name: selectedYear });

  if (props.league) {
    leagueName = props.league.toUpperCase();
    if (props.league === 'mls') {
      teams = mlsTeams;
      players = mlsPlayers;
      goalsAdded = mlsGoalsAdded;
      isLoadingTeams = mlsIsLoadingTeams;
      isLoadingPlayers = mlsIsLoadingPlayers;
      isLoadingGoalsAdded = mlsIsLoadingGoalsAdded;
    } else if (props.league === 'nwsl') {
      teams = nwslTeams;
      players = nwslPlayers;
      goalsAdded = nwslGoalsAdded;
      isLoadingTeams = nwslIsLoadingTeams;
      isLoadingPlayers = nwslIsLoadingPlayers;
      isLoadingGoalsAdded = nwslIsLoadingGoalsAdded;
    }
  }

  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [playerNameFilter, setPlayerNameFilter] = useState<string>('');

  // Debug logging
  useEffect(() => {
    if (!isLoadingTeams && !isLoadingPlayers && !isLoadingGoalsAdded) {
      console.log(`${leagueName} Data:`, {
        teams,
        players,
        goalsAdded,
        playerIds: goalsAdded?.map(p => p.player_id) ?? [],
        missingPlayers: goalsAdded?.filter(p => !players?.find(pl => pl.player_id === p.player_id)) ?? [],
        playerMap: players?.reduce((acc, p) => ({ ...acc, [p.player_id]: p.player_name }), {}) ?? {},
      });
    }
  }, [leagueName, teams, players, goalsAdded, isLoadingTeams, isLoadingPlayers, isLoadingGoalsAdded]);

  // Memoized data processing
  const { data, columns } = useMemo(() => {
    if (!goalsAdded?.length || !players?.length || !teams?.length) {
      return { data: [], columns: BASE_COLUMNS };
    }

    // Build lookup maps
    const playerMap: Record<string, string> = {};
    const teamMap: Record<string, string> = {};
    
    players?.forEach((p) => {
      playerMap[String(p.player_id)] = p.player_name;
    });
    teams?.forEach((t) => {
      teamMap[String(t.team_id)] = t.team_name;
    });

    // Filter goals added data by team if a team is selected
    const filteredGoalsAdded = selectedTeam
      ? goalsAdded?.filter((player) => String(player.team_id) === selectedTeam)
      : goalsAdded ?? [];

    // Find all unique action types
    const actionTypes = Array.from(
      new Set(
        filteredGoalsAdded.flatMap((player) => (player.data ?? []).map((a) => a.action_type))
      )
    ) as string[];

    // Group goals added data by player to handle multiple teams
    const playerDataMap = new Map<string, PlayerData>();
    filteredGoalsAdded.forEach((player) => {
      const playerId = String(player.player_id);
      if (!playerDataMap.has(playerId)) {
        playerDataMap.set(playerId, {
          player_id: player.player_id,
          team_ids: new Set<string>(),
          data: [],
        });
      }
      const playerData = playerDataMap.get(playerId);
      if (playerData) {
        playerData.team_ids.add(String(player.team_id));
        playerData.data.push(...(player.data ?? []));
      }
    });

    // Pivot data: for each player, create a row with action columns and total
    const mapped = Array.from(playerDataMap.values()).map((playerData) => {
      const actionMap: Record<string, number> = {};
      let total = 0;
      playerData.data.forEach((a) => {
        actionMap[a.action_type] = (actionMap[a.action_type] || 0) + a.goals_added_above_avg;
        total += a.goals_added_above_avg;
      });

      const teamNames = Array.from(playerData.team_ids)
        .map(teamId => teamMap[teamId] || teamId)
        .join(', ');

      const playerName = playerMap[String(playerData.player_id)];
      if (!playerName) {
//        console.warn(`Missing player name for ID ${playerData.player_id}`);
      }

      return {
        id: playerData.player_id,
        player_name: playerName || `Unknown Player (${playerData.player_id})`,
        team_names: teamNames,
        goals_added_total: total,
        ...actionMap,
      };
    });

    // Filter by player name if filter is set
    const filteredData = playerNameFilter
      ? mapped.filter((row) =>
          row.player_name.toLowerCase().includes(playerNameFilter.toLowerCase())
        )
      : mapped;

    // Create dynamic columns for each action type
    const actionColumns: GridColDef[] = actionTypes.map((actionType) => ({
      field: actionType,
      headerName: actionType,
      width: 150,
      type: 'number',
    }));

    return {
      data: filteredData,
      columns: [...BASE_COLUMNS, ...actionColumns],
    };
  }, [goalsAdded, players, teams, selectedTeam, playerNameFilter]);

  if (isLoadingTeams || isLoadingPlayers || isLoadingGoalsAdded) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => onYearChange(e.target.value)}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Team</InputLabel>
          <Select
            value={selectedTeam}
            label="Team"
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <MenuItem value="">All Teams</MenuItem>
            {teams?.map((team) => (
              <MenuItem key={team.team_id} value={String(team.team_id)}>
                {team.team_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Filter Players"
          value={playerNameFilter}
          onChange={(e) => setPlayerNameFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        />
      </Box>

      <DataGrid
        rows={data}
        columns={columns}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: 'goals_added_total', sort: 'desc' }] },
        }}
        sx={{ height: 600 }}
      />
    </Box>
  );
} 