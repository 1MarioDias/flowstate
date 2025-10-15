import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SpotifyPlaylist, SpotifyTrack, SpotifyAudioFeatures } from '../types/spotify'
import type { PlaylistAnalysis, OptimizationOptions } from '../types/analysis'
import { SpotifyService } from '../services/spotifyService'
import { PlaylistAnalyzer } from '../services/playlistAnalyzer'

export const usePlaylistStore = defineStore('playlist', () => {
  // Services
  const spotifyService = new SpotifyService({
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
    redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || '',
    scopes: ['playlist-read-private', 'playlist-read-collaborative']
  })
  
  const playlistAnalyzer = new PlaylistAnalyzer()
  
  // State
  const isAuthenticated = ref(spotifyService.isAuthenticated())
  const currentPlaylist = ref<SpotifyPlaylist | null>(null)
  const currentTracks = ref<SpotifyTrack[]>([])
  const currentAudioFeatures = ref<SpotifyAudioFeatures[]>([])
  const analysis = ref<PlaylistAnalysis | null>(null)
  const isAnalyzing = ref(false)
  const error = ref<string | null>(null)
  
  // Computed
  const hasData = computed(() => currentTracks.value.length > 0)
  const trackCount = computed(() => currentTracks.value.length)
  
  // Actions
  const authenticate = async () => {
    const authUrl = await spotifyService.generateAuthUrl()
    window.location.href = authUrl
  }
  
  const handleCallback = async () => {
    try {
      const success = await spotifyService.handleCallback()
      if (success) {
        isAuthenticated.value = true
      }
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Authentication failed'
      return false
    }
  }
  
  const analyzePlaylist = async (playlistUrl: string) => {
    error.value = null
    isAnalyzing.value = true
    
    try {
      if (!isAuthenticated.value) {
        throw new Error('Not authenticated. Please login with Spotify.')
      }
      
      const playlistId = spotifyService.extractPlaylistId(playlistUrl)
      if (!playlistId) {
        throw new Error('Invalid Spotify playlist URL')
      }
      
      // Fetch playlist data
      const [playlist, tracks] = await Promise.all([
        spotifyService.getPlaylist(playlistId),
        spotifyService.getPlaylistTracks(playlistId)
      ])
      
      // Fetch audio features
      const audioFeatures = await spotifyService.getAudioFeatures(
        tracks.map(t => t.id)
      )
      
      // Store data
      currentPlaylist.value = playlist
      currentTracks.value = tracks
      currentAudioFeatures.value = audioFeatures
      
      // Analyze
      analysis.value = playlistAnalyzer.analyzePlaylist(tracks, audioFeatures)
      
      return analysis.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to analyze playlist'
      throw err
    } finally {
      isAnalyzing.value = false
    }
  }
  
  const optimizePlaylist = (options: OptimizationOptions) => {
    if (!analysis.value) {
      throw new Error('No analysis available')
    }
    
    const optimized = playlistAnalyzer.optimizePlaylistOrder(analysis.value, options)
    analysis.value.optimizedOrder = optimized
    
    return optimized
  }
  
  const logout = () => {
    spotifyService.logout()
    isAuthenticated.value = false
    reset()
  }
  
  const reset = () => {
    currentPlaylist.value = null
    currentTracks.value = []
    currentAudioFeatures.value = []
    analysis.value = null
    error.value = null
  }
  
  return {
    // State
    isAuthenticated,
    currentPlaylist,
    currentTracks,
    analysis,
    isAnalyzing,
    error,
    
    // Computed
    hasData,
    trackCount,
    
    // Actions
    authenticate,
    handleCallback,
    analyzePlaylist,
    optimizePlaylist,
    logout,
    reset
  }
})