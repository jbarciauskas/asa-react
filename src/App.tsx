import React from 'react';
import GoalsAddedTable from './components/GoalsAddedTable';
import NWSLGoalsAddedTable from './components/NWSLGoalsAddedTable';

function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Goals Added by Player (NWSL)</h1>
      <NWSLGoalsAddedTable />
    </div>
  );
}

export default App;
