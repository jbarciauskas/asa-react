import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { NWSLGoalsAddedPlayer, NWSLPlayer, NWSLTeam } from '../api/nwslApi';

export const nwslApi = createApi({
  reducerPath: 'nwslApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Teams', 'Players', 'GoalsAdded'],
  endpoints: (builder) => ({
    getTeams: builder.query<NWSLTeam[], void>({
      query: () => 'nwsl/teams',
      providesTags: ['Teams'],
    }),
    getPlayers: builder.query<NWSLPlayer[], void>({
      query: () => 'nwsl/players',
      providesTags: ['Players'],
    }),
    getGoalsAdded: builder.query<NWSLGoalsAddedPlayer[], { season_name: string }>({
      query: (params) => ({
        url: 'nwsl/players/goals-added',
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
} = nwslApi; 