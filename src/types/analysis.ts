import type { SpotifyTrack, SpotifyAudioFeatures, CamelotKey } from './spotify'

export interface TrackAnalysis {
  track: SpotifyTrack
  audioFeatures: SpotifyAudioFeatures
  camelotKey: CamelotKey
  harmonicCompatibility: string[]
  energyScore: number
  bpmCategory: 'slow' | 'medium' | 'fast' | 'very-fast'
}

export interface PlaylistAnalysis {
  tracks: TrackAnalysis[]
  averageTempo: number
  averageEnergy: number
  keyDistribution: Record<string, number>
  genreDistribution: Record<string, number>
  optimizedOrder: TrackAnalysis[]
  transitionScore: number
}

export interface OptimizationOptions {
  prioritizeHarmony: boolean
  prioritizeEnergy: boolean
  allowKeyJumps: boolean
  targetEnergyFlow: 'ascending' | 'descending' | 'wave' | 'plateau'
}