import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Player, Team, GoalsAddedPlayer } from '../api/types';

export const nwslApi = createApi({
  reducerPath: 'nwslApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/nwsl' }),
  tagTypes: ['Teams', 'Players', 'GoalsAdded'],
  endpoints: (builder) => ({
    getTeams: builder.query<Team[], void>({
      query: () => 'teams',
      providesTags: ['Teams'],
    }),
    getPlayers: builder.query<Player[], void>({
      query: () => 'players',
      providesTags: ['Players'],
      transformResponse: (response: Player[]) => {
        // The API client handles pagination, so we just return the full response
        return response;
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
} = nwslApi; 