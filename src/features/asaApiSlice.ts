import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError, BaseQueryApi } from '@reduxjs/toolkit/query';
import { Player, Team, GoalsAddedPlayer, CommonApiParams } from '../api/types';

async function fetchAllPlayers(
  baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  league: string,
  params: any,
  api: BaseQueryApi,
  extraOptions: object
) {
  let offset = 0;
  let allPlayers: Player[] = [];
  while (true) {
    const result = await baseQuery(
      { url: `${league}/players`, params: { ...params, offset } },
      api,
      extraOptions
    );
    if (result.error) throw result.error;
    const players = result.data as Player[];
    allPlayers = allPlayers.concat(players);
    if (!players || players.length < 1000) break;
    offset += 1000;
  }
  return allPlayers;
}

export const asaApi = createApi({
  reducerPath: 'asaApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Teams', 'Players', 'GoalsAdded'],
  endpoints: (builder) => ({
    getTeams: builder.query<Team[], { league: string }>({
      query: ({ league }) => `${league}/teams`,
      providesTags: ['Teams'],
    }),
    getPlayers: builder.query<Player[], { league: string } & CommonApiParams>({
      async queryFn(arg, api, extraOptions, baseQuery) {
        const { league, ...params } = arg;
        try {
          const allPlayers = await fetchAllPlayers(baseQuery, league, params, api, extraOptions);
          return { data: allPlayers };
        } catch (error) {
          return { error: error as FetchBaseQueryError };
        }
      },
      providesTags: ['Players'],
    }),
    getGoalsAdded: builder.query<GoalsAddedPlayer[], { league: string; season_name?: string } & CommonApiParams>({
      query: ({ league, ...params }) => ({
        url: `${league}/players/goals-added`,
        params,
      }),
      providesTags: (result, error, arg) => {
        const tagId = [
          arg.league,
          arg.season_name || 'no-season',
          arg.minimum_minutes?.toString() || 'no-min',
          arg.start_date || 'no-start',
          arg.end_date || 'no-end'
        ].join('-');
        
        return [
          { type: 'GoalsAdded', id: tagId }
        ];
      },
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetPlayersQuery,
  useGetGoalsAddedQuery,
} = asaApi; 