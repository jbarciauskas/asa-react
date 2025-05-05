import { configureStore } from '@reduxjs/toolkit';
import goalsAddedReducer from '../features/goalsAddedSlice';
import { nwslApi } from '../features/nwslApiSlice';

export const store = configureStore({
  reducer: {
    goalsAdded: goalsAddedReducer,
    [nwslApi.reducerPath]: nwslApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(nwslApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 