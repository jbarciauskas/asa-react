import { SoccerApiClient } from './apiClient';
import { Player, Team, GoalsAddedPlayer, GoalsAddedParams, XGoalsParams, XPassParams } from './types';

// Create MLS client instance
const mlsClient = new SoccerApiClient('/mls');

// Re-export types
export type MLSPlayer = Player;
export type MLSTeam = Team;
export type MLSGoalsAddedAction = GoalsAddedPlayer['data'][0];
export type MLSGoalsAddedPlayer = GoalsAddedPlayer;

// Re-export API functions
export const getMLSPlayers = mlsClient.getPlayers.bind(mlsClient);
export const getMLSTeams = mlsClient.getTeams.bind(mlsClient);
export const getMLSGoalsAddedPlayers = mlsClient.getGoalsAddedPlayers.bind(mlsClient);
export const getMLSXGoalsPlayers = mlsClient.getXGoalsPlayers.bind(mlsClient);
export const getMLSXPassPlayers = mlsClient.getXPassPlayers.bind(mlsClient); 