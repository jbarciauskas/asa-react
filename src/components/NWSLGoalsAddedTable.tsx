import { useMemo, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FormControl, InputLabel, Select, MenuItem, Box, TextField } from '@mui/material';
import { useGetTeamsQuery, useGetPlayersQuery, useGetGoalsAddedQuery } from '../features/nwslApiSlice';

interface ActionData {
  action_type: string;
  goals_added_above_avg: number;
}

interface PlayerData {
  player_id: number;
  team_ids: Set<string>;
  data: ActionData[];
}

interface GoalsAddedPlayer {
  player_id: number;
  team_id: number;
  data: ActionData[];
}

const BASE_COLUMNS: GridColDef[] = [
  { field: 'player_name', headerName: 'Player', width: 180 },
  { field: 'team_names', headerName: 'Teams', width: 200 },
  { field: 'goals_added_total', headerName: 'Goals Added (Total)', width: 180, type: 'number' },
];

export default function NWSLGoalsAddedTable() {
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [playerNameFilter, setPlayerNameFilter] = useState<string>('');
  const [years] = useState<string[]>(['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016']);

  // RTK Query hooks
  const { data: teams = [], isLoading: isLoadingTeams } = useGetTeamsQuery();
  const { data: players = [], isLoading: isLoadingPlayers } = useGetPlayersQuery();
  const { data: goalsAdded = [], isLoading: isLoadingGoalsAdded } = useGetGoalsAddedQuery({
    season_name: selectedYear,
  });

  // Memoized data processing
  const { data, columns } = useMemo(() => {
    if (!goalsAdded.length || !players.length || !teams.length) {
      return { data: [], columns: BASE_COLUMNS };
    }

    // Build lookup maps
    const playerMap: Record<string, string> = {};
    const teamMap: Record<string, string> = {};
    
    players.forEach((p) => {
      playerMap[String(p.player_id)] = p.player_name;
    });
    teams.forEach((t) => {
      teamMap[String(t.team_id)] = t.team_name;
    });

    // Filter goals added data by team if a team is selected
    const filteredGoalsAdded = selectedTeam
      ? goalsAdded.filter((player: GoalsAddedPlayer) => String(player.team_id) === selectedTeam)
      : goalsAdded;

    // Find all unique action types
    const actionTypes = Array.from(
      new Set(
        filteredGoalsAdded.flatMap((player: GoalsAddedPlayer) => (player.data ?? []).map((a) => a.action_type))
      )
    ) as string[];

    // Group goals added data by player to handle multiple teams
    const playerDataMap = new Map<string, PlayerData>();
    filteredGoalsAdded.forEach((player: GoalsAddedPlayer) => {
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

      const playerName = playerMap[String(playerData.player_id)] || playerData.player_id;

      return {
        player_id: playerData.player_id,
        player_name: playerName,
        team_names: teamNames,
        goals_added_total: total,
        ...actionMap,
      };
    });

    // Filter by player name if filter is set
    const filteredData = playerNameFilter
      ? mapped.filter(row => 
          String(row.player_name).toLowerCase().includes(playerNameFilter.toLowerCase())
        )
      : mapped;

    // Build columns dynamically
    const dynamicColumns: GridColDef[] = actionTypes.map((action: string) => ({
      field: action,
      headerName: action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      width: 160,
      type: 'number',
    }));

    return {
      data: filteredData,
      columns: [...BASE_COLUMNS, ...dynamicColumns],
    };
  }, [goalsAdded, players, teams, selectedTeam, playerNameFilter]);

  const isLoading = isLoadingTeams || isLoadingPlayers || isLoadingGoalsAdded;

  if (isLoading && !data.length) return <div>Loading...</div>;

  return (
    <div>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(e.target.value)}
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
            {teams.map((team) => (
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
          placeholder="Enter player name..."
        />
      </Box>
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
            filter: { filterModel: { items: [] } },
            sorting: {
              sortModel: [{ field: 'goals_added_total', sort: 'desc' }],
            },
          }}
          getRowId={(row) => row.player_id}
          disableRowSelectionOnClick
        />
      </div>
    </div>
  );
} 