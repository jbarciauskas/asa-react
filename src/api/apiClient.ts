import axios from 'axios';
import {
  Player,
  Team,
  GoalsAddedPlayer,
  GoalsAddedParams,
  XGoalsParams,
  XPassParams,
} from './types';

export class SoccerApiClient {
  private api;
  private readonly PAGE_SIZE = 1000;

  constructor(basePath: string) {
    this.api = axios.create({
      baseURL: `/api/v1${basePath}`,
    });

    // Add response interceptor for debugging
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response (${basePath}):`, {
          url: response.config.url,
          method: response.config.method,
          status: response.status,
          data: response.data,
        });
        return response;
      },
      (error) => {
        console.error(`API Error (${basePath}):`, {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  // Get all players with pagination
  async getPlayers(params?: { player_id?: string }): Promise<Player[]> {
    try {
      console.log(`Fetching players (${this.api.defaults.baseURL}):`, params);
      const allPlayers: Player[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const res = await this.api.get('/players', {
          params: {
            ...params,
            offset
          },
        });
        
        const players = res.data;
        allPlayers.push(...players);
        
        // If we got fewer results than the page size, we've reached the end
        console.log(players.length);
        hasMore = players.length === this.PAGE_SIZE;
        offset += this.PAGE_SIZE;
      }

      console.log(`Players response (${this.api.defaults.baseURL}):`, {
        total: allPlayers.length,
        players: allPlayers,
      });
      
      return allPlayers;
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  }

  // Get all teams
  async getTeams(params?: { team_id?: string }): Promise<Team[]> {
    try {
      console.log(`Fetching teams (${this.api.defaults.baseURL}):`, params);
      const res = await this.api.get('/teams', { params });
      console.log(`Teams response (${this.api.defaults.baseURL}):`, res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  // Get goals added by player
  async getGoalsAddedPlayers(params?: GoalsAddedParams): Promise<GoalsAddedPlayer[]> {
    try {
      console.log(`Fetching goals added (${this.api.defaults.baseURL}):`, params);
      const res = await this.api.get('/players/goals-added', { params });
      console.log(`Goals added response (${this.api.defaults.baseURL}):`, res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching goals added:', error);
      throw error;
    }
  }

  // Get xGoals by player
  async getXGoalsPlayers(params?: XGoalsParams) {
    try {
      console.log(`Fetching xGoals (${this.api.defaults.baseURL}):`, params);
      const res = await this.api.get('/players/xgoals', { params });
      console.log(`xGoals response (${this.api.defaults.baseURL}):`, res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching xGoals:', error);
      throw error;
    }
  }

  // Get xPass by player
  async getXPassPlayers(params?: XPassParams) {
    try {
      console.log(`Fetching xPass (${this.api.defaults.baseURL}):`, params);
      const res = await this.api.get('/players/xpass', { params });
      console.log(`xPass response (${this.api.defaults.baseURL}):`, res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching xPass:', error);
      throw error;
    }
  }
} 