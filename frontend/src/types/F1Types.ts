export interface RegistroVolta {
  meeting_id: number;
  session_id: number;
  race_name: string;
  country: string;
  location: string;
  circuit_key: number;
  race_date: string;
  driver_number: number;
  driver_name: string;
  team_name: string;
  lap_number: number;
  lap_start_time: string;
  position: number;
  lap_time: number;
  sector_1: number;
  sector_2: number;
  sector_3: number;
  compound: string;
  stint_number: number;
  stint_lap_start: number;
  stint_lap_end: number;
  tire_age: number;
  degradation: number;
  rolling_pace: number;
  lap_time_delta: number;
  pit_flag: number; // 1 = pit stop nesta volta, 0 = caso contrário
  pit_count: number;
  pit_loss: number;
  consistency_score: number;
  strategy_type: string;
  final_position: number;
  position_change: number;
}

export interface ParadaPit {
  driver_number: number;
  driver_name: string;
  team_name: string;
  lap_number: number;
  pit_loss: number;
  compound_before: string;
  compound_after: string;
  position_before: number;
  position_after: number;
}

export interface ResultadoEstrategia {
  strategy_type: string;
  count: number;
  avg_final_position: number;
  avg_pit_loss: number;
  avg_degradation: number;
  avg_consistency: number;
}

export interface PerfilPiloto {
  driver_name: string;
  driver_number: number;
  team_name: string;
  avg_final_position: number;
  avg_pit_count: number;
  preferred_strategies: string[];
  degradation_profile: { compound: string; avg_deg: number }[];
  consistency_score: number;
}

export interface PerfilEquipe {
  team_name: string;
  avg_pit_duration: number; // baseado no pit_loss médio
  undercut_success_rate: number;
  overcut_success_rate: number;
  strategy_efficiency: number;
}
