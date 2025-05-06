import { SoccerApiClient } from './apiClient';
import { Player, Team, GoalsAddedPlayer, GoalsAddedParams, XGoalsParams, XPassParams } from './types';

// Create NWSL client instance
const nwslClient = new SoccerApiClient('/nwsl');

// Re-export types
export type NWSLPlayer = Player;
export type NWSLTeam = Team;
export type NWSLGoalsAddedAction = GoalsAddedPlayer['data'][0];
export type NWSLGoalsAddedPlayer = GoalsAddedPlayer;

// Re-export API functions
export const getNWSLPlayers = nwslClient.getPlayers.bind(nwslClient);
export const getNWSLTeams = nwslClient.getTeams.bind(nwslClient);
export const getNWSLGoalsAddedPlayers = nwslClient.getGoalsAddedPlayers.bind(nwslClient);
export const getNWSLXGoalsPlayers = nwslClient.getXGoalsPlayers.bind(nwslClient);
export const getNWSLXPassPlayers = nwslClient.getXPassPlayers.bind(nwslClient);

// Add more endpoint wrappers as needed for NWSL... 