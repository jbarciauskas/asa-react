import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { fetchGoalsAdded } from '../features/goalsAddedSlice';
import { RootState, AppDispatch } from '../app/store';

const columns: GridColDef[] = [
  { field: 'player_name', headerName: 'Player', width: 180 },
  { field: 'team', headerName: 'Team', width: 140 },
  { field: 'goals_added', headerName: 'Goals Added', width: 140, type: 'number' },
  // Add more columns as needed
];

export default function GoalsAddedTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, status } = useSelector((state: RootState) => state.goalsAdded);

  useEffect(() => {
    dispatch(fetchGoalsAdded());
  }, [dispatch]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Error loading data.</div>;

  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columns}
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25, page: 0 } },
          filter: { filterModel: { items: [] } },
        }}
        getRowId={(row) => row.player_id}
        disableRowSelectionOnClick
      />
    </div>
  );
} 