import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: '/api/v1',
});

// --- TypeScript Models ---

// Generic NWSL player model (expand as needed)
export interface NWSLPlayer {
  player_id: number;
  player_name: string;
  team_id?: number;
  team_name?: string;
  // Add more fields as needed
}

export interface NWSLTeam {
  team_id: number;
  team_name: string;
  // Add more fields as needed
}

// Goals Added by Player (NWSL) with actions
export interface NWSLGoalsAddedAction {
  action_type: string;
  goals_added_above_avg: number;
  goals_added_raw: number;
  count_actions: number;
  // Add more fields as needed
}

export interface NWSLGoalsAddedPlayer {
  player_id: number;
  team_id: number;
  data: NWSLGoalsAddedAction[];
  // Add more fields as needed
}

// --- API Functions ---

// Get all NWSL players
export async function getNWSLPlayers(params?: { player_id?: string }) {
  const res = await api.get('/nwsl/players', { params });
  return res.data;
}

// Get all NWSL teams
export async function getNWSLTeams(params?: { team_id?: string }) {
  const res = await api.get('/nwsl/teams', { params });
  return res.data;
}

// Get goals added by NWSL player
export async function getNWSLGoalsAddedPlayers(params?: {
  minimum_minutes?: number;
  minimum_actions?: number;
  player_id?: string;
  team_id?: string;
  season_name?: string;
  start_date?: string;
  end_date?: string;
  split_by_teams?: boolean;
  split_by_seasons?: boolean;
  split_by_games?: boolean;
  stage_name?: string;
  general_position?: string;
}): Promise<NWSLGoalsAddedPlayer[]> {
  const res = await api.get('/nwsl/players/goals-added', { params });
  return res.data as NWSLGoalsAddedPlayer[];
}

// Get xGoals by NWSL player
export async function getNWSLXGoalsPlayers(params?: {
  minimum_minutes?: number;
  minimum_shots?: number;
  minimum_key_passes?: number;
  player_id?: string;
  team_id?: string;
  season_name?: string;
  start_date?: string;
  end_date?: string;
  shot_pattern?: string;
  split_by_teams?: boolean;
  split_by_seasons?: boolean;
  split_by_games?: boolean;
  stage_name?: string;
  general_position?: string;
}) {
  const res = await api.get('/nwsl/players/xgoals', { params });
  return res.data;
}

// Add more endpoint wrappers as needed for NWSL... 