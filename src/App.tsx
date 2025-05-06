import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import LeagueGoalsAddedTable from './components/LeagueGoalsAddedTable';

function App() {
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Soccer Analytics Dashboard
        </Typography>
        
        <Box mb={6}>
          <Typography variant="h4" component="h2" gutterBottom>
            NWSL G+
          </Typography>
          <LeagueGoalsAddedTable league="nwsl" />
        </Box>

        <Box>
          <Typography variant="h4" component="h2" gutterBottom>
            MLS G+
          </Typography>
          <LeagueGoalsAddedTable league="mls" />
        </Box>
      </Box>
    </Container>
  );
}

export default App;
