import { useMemo, useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FormControl, InputLabel, Select, MenuItem, Box, TextField, Button, Tooltip } from '@mui/material';
import { Player, Team, GoalsAddedPlayer } from '../api/types';
import { useGetTeamsQuery, useGetPlayersQuery, useGetGoalsAddedQuery } from '../features/asaApiSlice';

interface PlayerGoalsAddedTableProps {
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
  minutes_played: number;
}

const BASE_COLUMNS: GridColDef[] = [
  { field: 'player_name', headerName: 'Player', width: 180 },
  { field: 'team_names', headerName: 'Teams', width: 200 },
  { field: 'minutes_played', headerName: 'Minutes Played', width: 150, type: 'number' },
  { field: 'goals_added_total', headerName: 'Goals Added (Total)', width: 180, type: 'number' },
];

// Helper function to convert table data to CSV
const convertToCSV = (data: any[], columns: GridColDef[]): string => {
  // Get header row
  const headers = columns.map(col => col.headerName || col.field).join(',');
  
  // Get data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.field];
      // Handle values that need quotes (strings with commas, quotes, or newlines)
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  }).join('\n');
  
  return `${headers}\n${rows}`;
};

export default function PlayerGoalsAddedTable(props: PlayerGoalsAddedTableProps) {
  // If league is provided, fetch data internally
  const [internalYear, setInternalYear] = useState('2025');
  const years = props.years ?? ['2025', '2024', '2023', '2022', '2021', '2020'];

  // Filter states
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [playerNameFilter, setPlayerNameFilter] = useState<string>('');
  const [minimumMinutes, setMinimumMinutes] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      const csvData = convertToCSV(data, columns);
      await navigator.clipboard.writeText(csvData);
      // You could add a toast notification here if you have a notification system
      console.log('Table data copied to clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Clear all filters function
  const clearFilters = () => {
    setSelectedTeam('');
    setPlayerNameFilter('');
    setMinimumMinutes('');
    setStartDate('');
    setEndDate('');
    // Reset year to default when clearing date filters
    if (props.onYearChange) {
      props.onYearChange('2025');
    } else {
      setInternalYear('2025');
    }
  };

  let teams = props.teams;
  let players = props.players;
  let goalsAdded = props.goalsAdded;
  let isLoadingTeams = props.isLoadingTeams;
  let isLoadingPlayers = props.isLoadingPlayers;
  let isLoadingGoalsAdded = props.isLoadingGoalsAdded;
  let leagueName = props.leagueName;
  let selectedYear = props.selectedYear ?? internalYear;
  let onYearChange = props.onYearChange ?? setInternalYear;

  // Build query parameters
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const mlsQueryParams = {
    league: 'mls' as const,
    ...(startDate || endDate 
      ? { 
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
          ...(startDate && !endDate && { end_date: getCurrentDate() })
        }
      : { season_name: selectedYear }
    ),
    ...(minimumMinutes && { minimum_minutes: parseInt(minimumMinutes) }),
  };

  const nwslQueryParams = {
    league: 'nwsl' as const,
    ...(startDate || endDate 
      ? { 
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
          ...(startDate && !endDate && { end_date: getCurrentDate() })
        }
      : { season_name: selectedYear }
    ),
    ...(minimumMinutes && { minimum_minutes: parseInt(minimumMinutes) }),
  };

  // Always call all hooks
  const { data: mlsTeams, isLoading: mlsIsLoadingTeams } = useGetTeamsQuery({ league: 'mls' });
  const { data: mlsPlayers, isLoading: mlsIsLoadingPlayers } = useGetPlayersQuery({ league: 'mls' });
  const { data: mlsGoalsAdded, isLoading: mlsIsLoadingGoalsAdded } = useGetGoalsAddedQuery(mlsQueryParams);

  const { data: nwslTeams, isLoading: nwslIsLoadingTeams } = useGetTeamsQuery({ league: 'nwsl' });
  const { data: nwslPlayers, isLoading: nwslIsLoadingPlayers } = useGetPlayersQuery({ league: 'nwsl' });
  const { data: nwslGoalsAdded, isLoading: nwslIsLoadingGoalsAdded } = useGetGoalsAddedQuery(nwslQueryParams);

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
          minutes_played: 0,
        });
      }
      const playerData = playerDataMap.get(playerId);
      if (playerData) {
        playerData.team_ids.add(String(player.team_id));
        playerData.data.push(...(player.data ?? []));
        // Sum up minutes played from all teams for this player
        playerData.minutes_played += player.minutes_played || 0;
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
        minutes_played: playerData.minutes_played,
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
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => onYearChange(e.target.value)}
            disabled={!!(startDate || endDate)}
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

        <Tooltip title="Filter players who have played at least this many minutes">
          <TextField
            label="Minimum Minutes"
            type="number"
            value={minimumMinutes}
            onChange={(e) => setMinimumMinutes(e.target.value)}
            sx={{ minWidth: 150 }}
            placeholder="e.g., 500"
            helperText="Minimum minutes played"
          />
        </Tooltip>

        <Tooltip title="Filter data from this date onwards (requires end date, overrides year selection)">
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ minWidth: 150 }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              max: endDate || undefined
            }}
            helperText={startDate || endDate ? "Date filters override year selection" : ""}
          />
        </Tooltip>

        <Tooltip title="Filter data up to this date (required when using start date, defaults to today)">
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={{ minWidth: 150 }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: startDate || undefined
            }}
            helperText={
              startDate || endDate 
                ? startDate && !endDate 
                  ? "Auto-set to today" 
                  : "Date filters override year selection"
                : ""
            }
            placeholder={startDate && !endDate ? getCurrentDate() : undefined}
          />
        </Tooltip>

        <Button variant="outlined" onClick={clearFilters}>
          Clear Filters
        </Button>

        <Button variant="contained" onClick={copyToClipboard} sx={{ ml: 'auto' }}>
          Copy to Clipboard
        </Button>
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