import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface GoalsAddedData {
  player_id: number;
  player_name: string;
  team: string;
  goals_added: number;
  // Add more fields as needed based on API response
}

interface GoalsAddedState {
  data: GoalsAddedData[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: GoalsAddedState = {
  data: [],
  status: 'idle',
};

export const fetchGoalsAdded = createAsyncThunk(
  'goalsAdded/fetchGoalsAdded',
  async () => {
    const response = await axios.get('https://app.americansocceranalysis.com/api/v1/goals_added');
    return response.data;
  }
);

const goalsAddedSlice = createSlice({
  name: 'goalsAdded',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoalsAdded.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGoalsAdded.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchGoalsAdded.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default goalsAddedSlice.reducer; 