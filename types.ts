
export interface FactCheckResult {
  text: string;
  sources: GroundingSource[];
  timestamp: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
