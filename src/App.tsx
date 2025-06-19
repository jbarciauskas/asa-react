import React, { useState } from 'react';
import { Box, Typography, Container, Tabs, Tab } from '@mui/material';
import LeagueGoalsAddedTable from './components/LeagueGoalsAddedTable';

type LeagueType = 'nwsl' | 'mls';
type SubTabType = 'players' | 'teams' | 'goalkeepers';

function App() {
  const [selectedLeague, setSelectedLeague] = useState<LeagueType>('nwsl');
  const [selectedSubTab, setSelectedSubTab] = useState<SubTabType>('players');

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Soccer Analytics Dashboard
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
          <LeagueGoalsAddedTable league={selectedLeague} />
        )}
        {selectedSubTab === 'teams' && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Teams View - Coming Soon
            </Typography>
            <Typography>
              Team-level analytics and statistics will be displayed here.
            </Typography>
          </Box>
        )}
        {selectedSubTab === 'goalkeepers' && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Goalkeepers View - Coming Soon
            </Typography>
            <Typography>
              Goalkeeper-specific analytics and statistics will be displayed here.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
