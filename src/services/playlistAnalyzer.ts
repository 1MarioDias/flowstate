import type { SpotifyTrack, SpotifyAudioFeatures } from '../types/spotify'
import type { TrackAnalysis, PlaylistAnalysis, OptimizationOptions } from '../types/analysis'
import { CamelotWheel } from '../utils/camelotWheel'

export class PlaylistAnalyzer {
  analyzeTrack(track: SpotifyTrack, audioFeatures: SpotifyAudioFeatures): TrackAnalysis {
    const camelotKey = CamelotWheel.getCamelotKey(audioFeatures.key, audioFeatures.mode)
    const harmonicCompatibility = CamelotWheel.getCompatibleKeys(camelotKey.camelotCode)
    
    return {
      track,
      audioFeatures,
      camelotKey,
      harmonicCompatibility,
      energyScore: this.calculateEnergyScore(audioFeatures),
      bpmCategory: this.categorizeBPM(audioFeatures.tempo)
    }
  }
  
  private calculateEnergyScore(features: SpotifyAudioFeatures): number {
    return (
      features.energy * 0.4 +
      features.danceability * 0.3 +
      features.valence * 0.2 +
      (features.tempo / 200) * 0.1
    )
  }
  
  private categorizeBPM(tempo: number): 'slow' | 'medium' | 'fast' | 'very-fast' {
    if (tempo < 100) return 'slow'
    if (tempo < 128) return 'medium'
    if (tempo < 140) return 'fast'
    return 'very-fast'
  }
  
  analyzePlaylist(
    tracks: SpotifyTrack[],
    audioFeatures: SpotifyAudioFeatures[]
  ): PlaylistAnalysis {
    const analyzedTracks = tracks.map((track, index) =>
      this.analyzeTrack(track, audioFeatures[index])
    )
    
    const averageTempo = audioFeatures.reduce((sum, f) => sum + f.tempo, 0) / audioFeatures.length
    const averageEnergy = audioFeatures.reduce((sum, f) => sum + f.energy, 0) / audioFeatures.length
    
    const keyDistribution = this.calculateKeyDistribution(analyzedTracks)
    
    return {
      tracks: analyzedTracks,
      averageTempo,
      averageEnergy,
      keyDistribution,
      genreDistribution: {},
      optimizedOrder: analyzedTracks,
      transitionScore: 0
    }
  }
  
  private calculateKeyDistribution(tracks: TrackAnalysis[]): Record<string, number> {
    const distribution: Record<string, number> = {}
    
    tracks.forEach(track => {
      const key = track.camelotKey.camelotCode
      distribution[key] = (distribution[key] || 0) + 1
    })
    
    return distribution
  }
  
  optimizePlaylistOrder(
    analysis: PlaylistAnalysis,
    options: OptimizationOptions
  ): TrackAnalysis[] {
    const tracks = [...analysis.tracks]
    const optimized: TrackAnalysis[] = []
    let remaining = [...tracks]
    
    // Start with a mid-energy track in a common key
    const starter = this.findStarterTrack(remaining)
    optimized.push(starter)
    remaining = remaining.filter(t => t.track.id !== starter.track.id)
    
    // Build the rest of the playlist
    while (remaining.length > 0) {
      const current = optimized[optimized.length - 1]
      const next = this.findBestNextTrack(current, remaining, options)
      
      optimized.push(next)
      remaining = remaining.filter(t => t.track.id !== next.track.id)
    }
    
    return optimized
  }
  
  private findStarterTrack(tracks: TrackAnalysis[]): TrackAnalysis {
    // Find a track with medium energy and common key
    const sorted = [...tracks].sort((a, b) => {
      const energyDiffA = Math.abs(a.energyScore - 0.6)
      const energyDiffB = Math.abs(b.energyScore - 0.6)
      return energyDiffA - energyDiffB
    })
    
    return sorted[0]
  }
  
  private findBestNextTrack(
    current: TrackAnalysis,
    candidates: TrackAnalysis[],
    options: OptimizationOptions
  ): TrackAnalysis {
    const scored = candidates.map(candidate => ({
      track: candidate,
      score: this.calculateTransitionScore(current, candidate, options)
    }))
    
    scored.sort((a, b) => b.score - a.score)
    return scored[0].track
  }
  
  private calculateTransitionScore(
    from: TrackAnalysis,
    to: TrackAnalysis,
    options: OptimizationOptions
  ): number {
    let score = 0
    
    // Harmonic compatibility (40% weight)
    if (options.prioritizeHarmony) {
      const harmonicScore = CamelotWheel.calculateHarmonicCompatibility(
        from.camelotKey,
        to.camelotKey
      )
      score += harmonicScore * 0.4
    }
    
    // BPM compatibility (30% weight)
    const bpmDiff = Math.abs(from.audioFeatures.tempo - to.audioFeatures.tempo)
    const bpmScore = Math.max(0, 1 - (bpmDiff / 20))
    score += bpmScore * 0.3
    
    // Energy flow (30% weight)
    if (options.prioritizeEnergy) {
      const energyDiff = to.energyScore - from.energyScore
      const energyScore = this.scoreEnergyTransition(energyDiff, options.targetEnergyFlow)
      score += energyScore * 0.3
    }
    
    return score
  }
  
  private scoreEnergyTransition(
    diff: number,
    flow: 'ascending' | 'descending' | 'wave' | 'plateau'
  ): number {
    switch (flow) {
      case 'ascending':
        return diff > 0 ? 1 : 0.5
      case 'descending':
        return diff < 0 ? 1 : 0.5
      case 'plateau':
        return Math.max(0, 1 - Math.abs(diff) * 2)
      case 'wave':
        return 0.8 // Accept any transition for wave
    }
  }
}