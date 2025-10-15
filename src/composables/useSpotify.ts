import { ref, computed } from 'vue'
import { SpotifyService } from '../services/spotifyService'

export function useSpotify() {
  const spotifyService = new SpotifyService({
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    scopes: ['playlist-read-private', 'playlist-read-collaborative']
  })
  
  const isAuthenticated = ref(false)
  const accessToken = ref<string | null>(null)
  const currentPlaylist = ref<SpotifyPlaylist | null>(null)
  
  const authenticate = () => {
    window.location.href = spotifyService.generateAuthUrl()
  }
  
  const analyzePlaylistFromUrl = async (url: string) => {
    const playlistId = extractPlaylistId(url)
    if (playlistId) {
      const tracks = await spotifyService.getPlaylistTracks(playlistId)
      const audioFeatures = await spotifyService.getAudioFeatures(
        tracks.map(t => t.id)
      )
      
      return { tracks, audioFeatures }
    }
    throw new Error('Invalid playlist URL')
  }
  
  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    authenticate,
    analyzePlaylistFromUrl,
    currentPlaylist: computed(() => currentPlaylist.value)
  }
}
