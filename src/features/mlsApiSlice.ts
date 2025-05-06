import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { MLSGoalsAddedPlayer, MLSPlayer, MLSTeam } from '../api/mlsApi';

export const mlsApi = createApi({
  reducerPath: 'mlsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/mls' }),
  tagTypes: ['Teams', 'Players', 'GoalsAdded'],
  endpoints: (builder) => ({
    getTeams: builder.query<MLSTeam[], void>({
      query: () => 'teams',
      providesTags: ['Teams'],
    }),
    getPlayers: builder.query<MLSPlayer[], void>({
      query: () => 'players',
      providesTags: ['Players'],
      transformResponse: (response: MLSPlayer[]) => {
        // The API client handles pagination, so we just return the full response
        return response;
      },
    }),
    getGoalsAdded: builder.query<MLSGoalsAddedPlayer[], { season_name: string }>({
      query: (params) => ({
        url: 'players/goals-added',
        params,
      }),
      providesTags: (result, error, arg) => [
        { type: 'GoalsAdded', id: arg.season_name }
      ],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetPlayersQuery,
  useGetGoalsAddedQuery,
} = mlsApi; 