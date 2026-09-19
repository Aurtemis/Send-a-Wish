export interface ClapThresholds {
  closeThreshold: number;
  openThreshold: number;
  approachVelocity: number;
  debounceMs: number;
}

export const DEFAULT_CLAP_THRESHOLDS: ClapThresholds = {
  closeThreshold: 0.15,
  openThreshold: 0.30,
  approachVelocity: 0.06,
  debounceMs: 350,
};