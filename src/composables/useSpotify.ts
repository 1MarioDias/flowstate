import { ref, computed, onMounted } from 'vue'
import { SpotifyService } from '../services/spotifyService'
import type { SpotifyPlaylist, SpotifyTrack, SpotifyAudioFeatures } from '../types/spotify'

export function useSpotify() {
  const spotifyService = new SpotifyService({
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    scopes: [
      'playlist-read-private',
      'playlist-read-collaborative'
    ]
  })
  
  const isAuthenticated = ref(spotifyService.isAuthenticated())
  const accessToken = ref<string | null>(null)
  const currentPlaylist = ref<SpotifyPlaylist | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  onMounted(() => {
    // Handle OAuth callback
    if (window.location.hash.includes('access_token')) {
      try {
        const success = spotifyService.handleCallback()
        if (success) {
          isAuthenticated.value = true
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Authentication failed'
      }
    }
  })
  
  const authenticate = () => {
    window.location.href = spotifyService.generateAuthUrl()
  }
  
  const extractPlaylistId = (url: string): string | null => {
    return spotifyService.extractPlaylistId(url)
  }
  
  const analyzePlaylistFromUrl = async (url: string) => {
    error.value = null
    isLoading.value = true
    
    try {
      if (!isAuthenticated.value) {
        throw new Error('Not authenticated. Please login with Spotify.')
      }
      
      const playlistId = extractPlaylistId(url)
      if (!playlistId) {
        throw new Error('Invalid Spotify playlist URL')
      }
      
      const [playlist, tracks] = await Promise.all([
        spotifyService.getPlaylist(playlistId),
        spotifyService.getPlaylistTracks(playlistId)
      ])
      
      const audioFeatures = await spotifyService.getAudioFeatures(
        tracks.map(t => t.id)
      )
      
      currentPlaylist.value = playlist
      
      return { 
        playlist,
        tracks, 
        audioFeatures 
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to analyze playlist'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    authenticate,
    analyzePlaylistFromUrl,
    currentPlaylist: computed(() => currentPlaylist.value),
    extractPlaylistId
  }
}