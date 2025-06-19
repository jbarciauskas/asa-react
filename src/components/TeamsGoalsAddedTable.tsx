import { useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FormControl, InputLabel, Select, MenuItem, Box, Button } from '@mui/material';
import { useGetTeamsGoalsAddedQuery, useGetTeamsQuery } from '../features/asaApiSlice';

interface TeamsGoalsAddedTableProps {
  league: 'mls' | 'nwsl';
  selectedYear: string;
  onYearChange: (year: string) => void;
  years: string[];
}

const BASE_COLUMNS: GridColDef[] = [
  { field: 'team_name', headerName: 'Team', width: 200 },
  { field: 'total_goals_added_for', headerName: 'Total G+ For', width: 150, type: 'number' },
  { field: 'total_goals_added_against', headerName: 'Total G+ Against', width: 150, type: 'number' },
  { field: 'total_goals_added_diff', headerName: 'Total G+ Difference', width: 150, type: 'number' },
];

export default function TeamsGoalsAddedTable(props: TeamsGoalsAddedTableProps) {
  const { league, selectedYear, onYearChange, years } = props;

  // Clear all filters function
  const clearFilters = () => {
    onYearChange('2025');
  };

  const queryParams = {
    league,
    season_name: selectedYear,
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