import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Player, Team, GoalsAddedPlayer, CommonApiParams } from '../api/types';
import { fetchAllPlayers } from '../api/utils';

export const mlsApi = createApi({
  reducerPath: 'mlsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/mls' }),
  tagTypes: ['Teams', 'Players', 'GoalsAdded'],
  endpoints: (builder) => ({
    getTeams: builder.query<Team[], void>({
      query: () => 'teams',
      providesTags: ['Teams'],
    }),
    getPlayers: builder.query<Player[], CommonApiParams>({
      query: (params) => ({
        url: 'players',
        params,
      }),
      providesTags: ['Players'],
      transformResponse: async (response: Player[]) => {
        return fetchAllPlayers('/api/v1/mls', response);
      },
    }),
    getGoalsAdded: builder.query<GoalsAddedPlayer[], { season_name: string }>({
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