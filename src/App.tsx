import React, { useState } from 'react';
import { Box, Typography, Container, Tabs, Tab } from '@mui/material';
import PlayerGoalsAddedTable from './components/PlayerGoalsAddedTable';
import TeamsGoalsAddedTable from './components/TeamsGoalsAddedTable';
import GoalkeepersGoalsAddedTable from './components/GoalkeepersGoalsAddedTable';

type LeagueType = 'nwsl' | 'mls';
type SubTabType = 'players' | 'teams' | 'goalkeepers';

function App() {
  const [selectedLeague, setSelectedLeague] = useState<LeagueType>('nwsl');
  const [selectedSubTab, setSelectedSubTab] = useState<SubTabType>('players');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const years = ['2025', '2024', '2023', '2022', '2021', '2020'];

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Goals Added (G+)
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          <p><a href="https://www.americansocceranalysis.com/what-are-goals-added">What are Goals Added (G+)?</a></p>
        </Typography>

        <Box mb={4}>
          <Tabs
            value={selectedLeague}
            onChange={(_e, newValue) => {
              setSelectedLeague(newValue);
              setSelectedSubTab('players'); // Reset to players tab when switching leagues
            }}
            aria-label="League Tabs"
          >
            <Tab label="NWSL G+" value="nwsl" />
            <Tab label="MLS G+" value="mls" />
          </Tabs>
        </Box>

        <Box mb={3}>
          <Tabs
            value={selectedSubTab}
            onChange={(_e, newValue) => setSelectedSubTab(newValue)}
            aria-label="Sub Tabs"
          >
            <Tab label="Players" value="players" />
            <Tab label="Teams" value="teams" />
            <Tab label="Goalkeepers" value="goalkeepers" />
          </Tabs>
        </Box>

        {selectedSubTab === 'players' && (
          <PlayerGoalsAddedTable league={selectedLeague} />
        )}
        {selectedSubTab === 'teams' && (
          <TeamsGoalsAddedTable 
            league={selectedLeague}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            years={years}
          />
        )}
        {selectedSubTab === 'goalkeepers' && (
          <GoalkeepersGoalsAddedTable 
            league={selectedLeague}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            years={years}
          />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        <p>Powered by the <a href="https://americansocceranalysis.com">American Soccer Analysis</a> API and data.</p> 
      </Typography>

    </Container>
  );
}

export default App;
