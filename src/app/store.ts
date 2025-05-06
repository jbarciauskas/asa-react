import { configureStore } from '@reduxjs/toolkit';
import goalsAddedReducer from '../features/goalsAddedSlice';
import { nwslApi } from '../features/nwslApiSlice';
import { mlsApi } from '../features/mlsApiSlice';

export const store = configureStore({
  reducer: {
    goalsAdded: goalsAddedReducer,
    [nwslApi.reducerPath]: nwslApi.reducer,
    [mlsApi.reducerPath]: mlsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(nwslApi.middleware, mlsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 