import type { SpotifyTrack, SpotifyAudioFeatures, SpotifyPlaylist } from '../types/spotify'

export interface SpotifyConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
}

export class SpotifyService {
  private config: SpotifyConfig
  private accessToken: string | null = null
  private tokenExpiry: number | null = null
  
  constructor(config: SpotifyConfig) {
    this.config = config
    this.loadTokenFromStorage()
  }
  
  private loadTokenFromStorage(): void {
    const token = localStorage.getItem('spotify_access_token')
    const expiry = localStorage.getItem('spotify_token_expiry')
    
    if (token && expiry && Date.now() < parseInt(expiry)) {
      this.accessToken = token
      this.tokenExpiry = parseInt(expiry)
    }
  }
  
  private saveTokenToStorage(token: string, expiresIn: number): void {
    const expiry = Date.now() + expiresIn * 1000
    localStorage.setItem('spotify_access_token', token)
    localStorage.setItem('spotify_token_expiry', expiry.toString())
    this.accessToken = token
    this.tokenExpiry = expiry
  }
  
  generateState(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  generateAuthUrl(): string {
    const state = this.generateState()
    localStorage.setItem('spotify_auth_state', state)
    
    const params = new URLSearchParams({
      response_type: 'token',
      client_id: this.config.clientId,
      scope: this.config.scopes.join(' '),
      redirect_uri: this.config.redirectUri,
      state,
      show_dialog: 'false'
    })
    
    return `https://accounts.spotify.com/authorize?${params.toString()}`
  }
  
  handleCallback(): boolean {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    
    const accessToken = params.get('access_token')
    const state = params.get('state')
    const expiresIn = params.get('expires_in')
    const storedState = localStorage.getItem('spotify_auth_state')
    
    if (state !== storedState) {
      throw new Error('State mismatch - possible CSRF attack')
    }
    
    if (accessToken && expiresIn) {
      this.saveTokenToStorage(accessToken, parseInt(expiresIn))
      localStorage.removeItem('spotify_auth_state')
      window.history.replaceState({}, document.title, window.location.pathname)
      return true
    }
    
    return false
  }
  
  isAuthenticated(): boolean {
    return this.accessToken !== null && 
           this.tokenExpiry !== null && 
           Date.now() < this.tokenExpiry
  }
  
  private async fetchSpotify<T>(endpoint: string): Promise<T> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated')
    }
    
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        this.accessToken = null
        localStorage.removeItem('spotify_access_token')
        localStorage.removeItem('spotify_token_expiry')
        throw new Error('Token expired')
      }
      throw new Error(`Spotify API error: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    return this.fetchSpotify<SpotifyPlaylist>(`/playlists/${playlistId}`)
  }
  
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const playlist = await this.getPlaylist(playlistId)
    let tracks = playlist.tracks.items.map(item => item.track)
    
    // Handle pagination if more than 100 tracks
    let nextUrl = playlist.tracks.next
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      })
      const data = await response.json()
      tracks = tracks.concat(data.items.map((item: any) => item.track))
      nextUrl = data.next
    }
    
    return tracks.filter(track => track !== null)
  }
  
  async getAudioFeatures(trackIds: string[]): Promise<SpotifyAudioFeatures[]> {
    // Spotify API allows max 100 IDs per request
    const chunks: string[][] = []
    for (let i = 0; i < trackIds.length; i += 100) {
      chunks.push(trackIds.slice(i, i + 100))
    }
    
    const allFeatures: SpotifyAudioFeatures[] = []
    
    for (const chunk of chunks) {
      const ids = chunk.join(',')
      const response = await this.fetchSpotify<{ audio_features: SpotifyAudioFeatures[] }>(
        `/audio-features?ids=${ids}`
      )
      allFeatures.push(...response.audio_features.filter(f => f !== null))
    }
    
    return allFeatures
  }
  
  extractPlaylistId(url: string): string | null {
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/)
    return match ? match[1] : null
  }
}