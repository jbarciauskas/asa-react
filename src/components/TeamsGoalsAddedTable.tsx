import { useMemo, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FormControl, InputLabel, Select, MenuItem, Box, TextField, Button, Tooltip } from '@mui/material';
import { useGetTeamsGoalsAddedQuery, useGetTeamsQuery } from '../features/asaApiSlice';

interface TeamsGoalsAddedTableProps {
  league: 'mls' | 'nwsl';
  selectedYear: string;
  onYearChange: (year: string) => void;
  years: string[];
}

const BASE_COLUMNS: GridColDef[] = [
  { field: 'team_name', headerName: 'Team', width: 200 },
  { field: 'total_goals_added', headerName: 'Total Goals Added', width: 180, type: 'number' },
];

export default function TeamsGoalsAddedTable(props: TeamsGoalsAddedTableProps) {
  const { league, selectedYear, onYearChange, years } = props;

  // Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Clear all filters function
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    onYearChange('2025');
  };

  // Build query parameters
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const queryParams = {
    league,
    ...(startDate || endDate 
      ? { 
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
          ...(startDate && !endDate && { end_date: getCurrentDate() })
        }
      : { season_name: selectedYear }
    ),
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
      let totalGoalsAdded = 0;

      team.data?.forEach((action) => {
        const actionKey = action.action_type;
        actionMap[`${actionKey}_actions_for`] = action.actions_for;
        actionMap[`${actionKey}_actions_against`] = action.actions_against;
        actionMap[`${actionKey}_goals_added_for`] = action.goals_added_for;
        actionMap[`${actionKey}_goals_added_against`] = action.goals_added_against;
        
        // Calculate net goals added for this action type
        const netGoalsAdded = action.goals_added_for - action.goals_added_against;
        actionMap[`${actionKey}_net_goals_added`] = netGoalsAdded;
        totalGoalsAdded += netGoalsAdded;
      });

      return {
        id: team.team_id,
        team_name: teamMap[String(team.team_id)] || `Unknown Team (${team.team_id})`,
        total_goals_added: totalGoalsAdded,
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
          field: `${actionType}_actions_for`,
          headerName: `${actionType} Actions For`,
          width: 120,
          type: 'number',
        },
        {
          field: `${actionType}_actions_against`,
          headerName: `${actionType} Actions Against`,
          width: 120,
          type: 'number',
        },
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
            disabled={!!(startDate || endDate)}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
      </Box>

      <DataGrid
        rows={data}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: 'total_goals_added', sort: 'desc' }] },
        }}
        sx={{ height: 600 }}
      />
    </Box>
  );
} 