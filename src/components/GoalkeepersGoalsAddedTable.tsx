import { useMemo, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FormControl, InputLabel, Select, MenuItem, Box, TextField, Button, Tooltip } from '@mui/material';
import { useGetGoalKeepersAddedQuery } from '../features/asaApiSlice';

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

interface GoalkeepersGoalsAddedTableProps {
  league: 'mls' | 'nwsl';
  selectedYear: string;
  onYearChange: (year: string) => void;
  years: string[];
}

interface ActionData {
  action_type: string;
  goals_added_above_avg: number;
}

const BASE_COLUMNS: GridColDef[] = [
  { field: 'player_name', headerName: 'Goalkeeper', width: 180 },
  { field: 'team_name', headerName: 'Team', width: 200 },
  { field: 'minutes_played', headerName: 'Minutes Played', width: 150, type: 'number' },
  { field: 'goals_added_total', headerName: 'Goals Added (Total)', width: 180, type: 'number' },
];

export default function GoalkeepersGoalsAddedTable(props: GoalkeepersGoalsAddedTableProps) {
  const { league, selectedYear, onYearChange, years } = props;

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
    ...(minimumMinutes && { minimum_minutes: parseInt(minimumMinutes) }),
  };

  const { data: goalkeepersGoalsAdded, isLoading } = useGetGoalKeepersAddedQuery(queryParams);

  // Memoized data processing
  const { data, columns } = useMemo(() => {
    if (!goalkeepersGoalsAdded?.length) {
      return { data: [], columns: BASE_COLUMNS };
    }

    // Filter by team if selected
    const filteredData = selectedTeam
      ? goalkeepersGoalsAdded.filter((gk) => String(gk.team_id) === selectedTeam)
      : goalkeepersGoalsAdded;

    // Find all unique action types
    const actionTypes = Array.from(
      new Set(
        filteredData.flatMap((gk) => (gk.data ?? []).map((a) => a.action_type))
      )
    ) as string[];

    // Process goalkeeper data
    const mapped = filteredData.map((gk) => {
      const actionMap: Record<string, number> = {};
      let total = 0;
      gk.data?.forEach((a) => {
        actionMap[a.action_type] = (actionMap[a.action_type] || 0) + a.goals_added_above_avg;
        total += a.goals_added_above_avg;
      });

      return {
        id: gk.player_id,
        player_name: gk.player_name,
        team_name: gk.team_name,
        minutes_played: gk.minutes_played || 0,
        goals_added_total: total,
        ...actionMap,
      };
    });

    // Filter by player name if filter is set
    const filteredMapped = playerNameFilter
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
      data: filteredMapped,
      columns: [...BASE_COLUMNS, ...actionColumns],
    };
  }, [goalkeepersGoalsAdded, selectedTeam, playerNameFilter]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Get unique teams for team filter
  const teams = Array.from(
    new Set(
      goalkeepersGoalsAdded?.map((gk) => ({ id: gk.team_id, name: gk.team_name })) || []
    )
  ).sort((a, b) => a.name.localeCompare(b.name));

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
            {teams.map((team) => (
              <MenuItem key={team.id} value={String(team.id)}>
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Filter Goalkeepers"
          value={playerNameFilter}
          onChange={(e) => setPlayerNameFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        <Tooltip title="Filter goalkeepers who have played at least this many minutes">
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
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: 'goals_added_total', sort: 'desc' }] },
        }}
        sx={{ height: 600 }}
      />
    </Box>
  );
} 