import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError, BaseQueryApi } from '@reduxjs/toolkit/query';
import { Player, Team, GoalsAddedPlayer, GoalsAddedTeam, GoalsAddedGoalkeeper, CommonApiParams } from '../api/types';

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
  tagTypes: ['Teams', 'Players', 'GoalsAdded', 'TeamsGoalsAdded', 'GoalkeepersGoalsAdded'],
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
    getTeamsGoalsAdded: builder.query<GoalsAddedTeam[], { league: string; season_name?: string } & CommonApiParams>({
      query: ({ league, ...params }) => ({
        url: `${league}/teams/goals-added`,
        params,
      }),
      providesTags: (result, error, arg) => {
        const tagId = [
          arg.league,
          'teams',
          arg.season_name || 'no-season',
          arg.start_date || 'no-start',
          arg.end_date || 'no-end'
        ].join('-');
        
        return [
          { type: 'TeamsGoalsAdded', id: tagId }
        ];
      },
    }),
    getGoalKeepersAdded: builder.query<GoalsAddedGoalkeeper[], { league: string; season_name?: string } & CommonApiParams>({
      query: ({ league, ...params }) => ({
        url: `${league}/players/goals-added`,
        params: { ...params, general_position: 'GK' },
      }),
      providesTags: (result, error, arg) => {
        const tagId = [
          arg.league,
          'goalkeepers',
          arg.season_name || 'no-season',
          arg.minimum_minutes?.toString() || 'no-min',
          arg.start_date || 'no-start',
          arg.end_date || 'no-end'
        ].join('-');
        
        return [
          { type: 'GoalkeepersGoalsAdded', id: tagId }
        ];
      },
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetPlayersQuery,
  useGetGoalsAddedQuery,
  useGetTeamsGoalsAddedQuery,
  useGetGoalKeepersAddedQuery,
} = asaApi; 