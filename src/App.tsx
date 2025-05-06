import React, { useState } from 'react';
import { Box, Typography, Container, Tabs, Tab } from '@mui/material';
import LeagueGoalsAddedTable from './components/LeagueGoalsAddedTable';

function App() {
  const [selectedLeague, setSelectedLeague] = useState<'nwsl' | 'mls'>('nwsl');

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Soccer Analytics Dashboard
        </Typography>

        <Box mb={4}>
          <Tabs
            value={selectedLeague}
            onChange={(_e, newValue) => setSelectedLeague(newValue)}
            aria-label="League Tabs"
          >
            <Tab label="NWSL G+" value="nwsl" />
            <Tab label="MLS G+" value="mls" />
          </Tabs>
        </Box>

        <LeagueGoalsAddedTable league={selectedLeague} />
      </Box>
    </Container>
  );
}

export default App;
