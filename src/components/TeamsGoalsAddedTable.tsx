import { useMemo, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FormControl, InputLabel, Select, MenuItem, Box, Button, Chip, OutlinedInput } from '@mui/material';
import { useGetTeamsGoalsAddedQuery, useGetTeamsQuery } from '../features/asaApiSlice';

interface TeamsGoalsAddedTableProps {
  league: 'mls' | 'nwsl';
  selectedYear: string;
  onYearChange: (year: string) => void;
  years: string[];
}

const BASE_COLUMNS: GridColDef[] = [
  { field: 'team_name', headerName: 'Team', width: 200 },
  { field: 'minutes_played', headerName: 'Minutes Played', width: 150, type: 'number' },
  { field: 'total_goals_added_for', headerName: 'Total G+ For', width: 150, type: 'number' },
  { field: 'total_goals_added_against', headerName: 'Total G+ Against', width: 150, type: 'number' },
  { field: 'total_goals_added_diff', headerName: 'Total G+ Difference', width: 150, type: 'number' },
];

export default function TeamsGoalsAddedTable(props: TeamsGoalsAddedTableProps) {
  const { league, selectedYear, onYearChange, years } = props;

  // Helper function to get game state labels
  const getGameStateLabel = (value: number): string => {
    switch (value) {
      case -2: return 'Down 2+';
      case -1: return 'Down 1';
      case 0: return 'Tied';
      case 1: return 'Up 1';
      case 2: return 'Up 2+';
      default: return 'Unknown';
    }
  };

  // Filter states
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [selectedGameStates, setSelectedGameStates] = useState<number[]>([]);

  // Clear all filters function
  const clearFilters = () => {
    setSelectedZones([]);
    setSelectedGameStates([]);
    onYearChange('2025');
  };

  const queryParams = {
    league,
    season_name: selectedYear,
    ...(selectedZones.length > 0 && { zone: selectedZones }),
    ...(selectedGameStates.length > 0 && { gamestate_trunc: selectedGameStates }),
  };

  const { data: teamsGoalsAdded, isLoading: isLoadingGoalsAdded } = useGetTeamsGoalsAddedQuery(queryParams);
  const { data: teams, isLoading: isLoadingTeams } = useGetTeamsQuery({ league });

  // Memoized data processing
  const { data, columns } = useMemo(() => {
    if (!teamsGoalsAdded?.length || !teams?.length) {
      return { data: [], columns: BASE_COLUMNS };
    }

    // Build team lookup map
    const teamMap: Record<string, string> = {};
    teams.forEach((team) => {
      teamMap[String(team.team_id)] = team.team_name;
    });

    // Process team data
    const mapped = teamsGoalsAdded.map((team) => {
      const actionMap: Record<string, any> = {};
      let totalGoalsAddedFor = 0;
      let totalGoalsAddedAgainst = 0;

      team.data?.forEach((action) => {
        const actionKey = action.action_type;
        actionMap[`${actionKey}_goals_added_for`] = action.goals_added_for;
        actionMap[`${actionKey}_goals_added_against`] = action.goals_added_against;
        
        // Calculate net goals added for this action type
        const netGoalsAdded = action.goals_added_for - action.goals_added_against;
        actionMap[`${actionKey}_net_goals_added`] = netGoalsAdded;
        if (actionKey !== 'Interrupting' && actionKey !== 'Claiming') {
          totalGoalsAddedFor += action.goals_added_for;
          totalGoalsAddedAgainst += action.goals_added_against;
        }
      });

      return {
        id: team.team_id,
        team_name: teamMap[String(team.team_id)] || `Unknown Team (${team.team_id})`,
        minutes_played: team.minutes || 0,
        total_goals_added_for: totalGoalsAddedFor,
        total_goals_added_against: totalGoalsAddedAgainst,
        total_goals_added_diff: totalGoalsAddedFor - totalGoalsAddedAgainst,
        ...actionMap,
      };
    });

    // Create dynamic columns for each action type
    const actionColumns: GridColDef[] = [];
    
    // Get unique action types from the first team (assuming all teams have the same action types)
    const actionTypes = teamsGoalsAdded[0]?.data?.map(a => a.action_type) || [];
    
    actionTypes.forEach((actionType) => {
      actionColumns.push(
        {
          field: `${actionType}_goals_added_for`,
          headerName: `${actionType} G+ For`,
          width: 120,
          type: 'number',
        },
        {
          field: `${actionType}_goals_added_against`,
          headerName: `${actionType} G+ Against`,
          width: 120,
          type: 'number',
        },
        {
          field: `${actionType}_net_goals_added`,
          headerName: `${actionType} Net G+`,
          width: 120,
          type: 'number',
        }
      );
    });

    return {
      data: mapped,
      columns: [...BASE_COLUMNS, ...actionColumns],
    };
  }, [teamsGoalsAdded, teams]);

  if (isLoadingGoalsAdded || isLoadingTeams) {
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
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Zones</InputLabel>
          <Select
            multiple
            value={selectedZones}
            onChange={(e) => setSelectedZones(typeof e.target.value === 'string' ? [] : e.target.value)}
            input={<OutlinedInput label="Zones" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((zone) => (
              <MenuItem key={zone} value={zone}>
                Zone {zone}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Game State</InputLabel>
          <Select
            multiple
            value={selectedGameStates}
            onChange={(e) => setSelectedGameStates(typeof e.target.value === 'string' ? [] : e.target.value)}
            input={<OutlinedInput label="Game State" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={`${value} (${getGameStateLabel(value)})`} size="small" />
                ))}
              </Box>
            )}
          >
            <MenuItem value={-2}>-2 (Down 2+)</MenuItem>
            <MenuItem value={-1}>-1 (Down 1)</MenuItem>
            <MenuItem value={0}>0 (Tied)</MenuItem>
            <MenuItem value={1}>1 (Up 1)</MenuItem>
            <MenuItem value={2}>2 (Up 2+)</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={clearFilters}>
          Clear Filters
        </Button>
      </Box>

      <DataGrid
        rows={data}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: 'total_goals_added_diff', sort: 'desc' }] },
        }}
        sx={{ height: 600 }}
      />
    </Box>
  );
} 