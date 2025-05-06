import { configureStore } from '@reduxjs/toolkit';
import { asaApi } from '../features/asaApiSlice';

export const store = configureStore({
  reducer: {
    [asaApi.reducerPath]: asaApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(asaApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 