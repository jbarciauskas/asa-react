// Generic player model
export interface Player {
  player_id: number;
  player_name: string;
  team_id?: number;
  team_name?: string;
  // Add more fields as needed
}

export interface Team {
  team_id: number;
  team_name: string;
  // Add more fields as needed
}

export interface League {
  league_name: string;
}

// Goals Added by Player with actions
export interface GoalsAddedAction {
  action_type: string;
  goals_added_above_avg: number;
  goals_added_raw: number;
  count_actions: number;
  // Add more fields as needed
}

export interface GoalsAddedPlayer {
  player_id: number;
  team_id: number;
  data: GoalsAddedAction[];
  minutes_played?: number;
  // Add more fields as needed
}

// Goals Added by Team with actions
export interface GoalsAddedTeamAction {
  action_type: string;
  actions_for: number;
  actions_against: number;
  goals_added_for: number;
  goals_added_against: number;
}

export interface GoalsAddedTeam {
  team_id: number;
  data: GoalsAddedTeamAction[];
}

export interface GoalsAddedGoalkeeper {
  player_id: number;
  player_name: string;
  team_id: number;
  team_name: string;
  data: GoalsAddedAction[];
  minutes_played?: number;
  // Add more fields as needed
}

// Common API parameters
export interface CommonApiParams {
  minimum_minutes?: number;
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
}

export interface GoalsAddedParams extends CommonApiParams {
  minimum_actions?: number;
}

export interface XGoalsParams extends CommonApiParams {
  minimum_shots?: number;
  minimum_key_passes?: number;
  shot_pattern?: string;
}

export interface XPassParams extends CommonApiParams {
  minimum_passes?: number;
  pass_origin_third?: string;
} 