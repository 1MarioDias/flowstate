import type { SpotifyTrack, SpotifyAudioFeatures, SpotifyPlaylist, SpotifyUser, SimplifiedPlaylist } from '../types/spotify'

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
  
  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const values = crypto.getRandomValues(new Uint8Array(length))
    return values.reduce((acc, x) => acc + possible[x % possible.length], '')
  }
  
  private async sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return await crypto.subtle.digest('SHA-256', data)
  }
  
  private base64encode(input: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  }
  
  async generateAuthUrl(): Promise<string> {
    // Generate code verifier and challenge for PKCE
    const codeVerifier = this.generateRandomString(64)
    const hashed = await this.sha256(codeVerifier)
    const codeChallenge = this.base64encode(hashed)
    const state = this.generateRandomString(16)
    
    // Store for later use
    localStorage.setItem('spotify_code_verifier', codeVerifier)
    localStorage.setItem('spotify_auth_state', state)
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      state: state,
      scope: this.config.scopes.join(' '),
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    })
    
    return `https://accounts.spotify.com/authorize?${params.toString()}`
  }
  
  async handleCallback(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const storedState = localStorage.getItem('spotify_auth_state')
    const codeVerifier = localStorage.getItem('spotify_code_verifier')
    
    // Check for errors
    const error = urlParams.get('error')
    if (error) {
      throw new Error(`Spotify authorization error: ${error}`)
    }
    
    // Validate state
    if (state !== storedState) {
      throw new Error('State mismatch - possible CSRF attack')
    }
    
    if (!code || !codeVerifier) {
      return false
    }
    
    try {
      // Exchange code for access token
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.config.redirectUri,
          code_verifier: codeVerifier,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`)
      }
      
      const data = await response.json()
      
      // Save tokens
      this.saveTokenToStorage(data.access_token, data.expires_in)
      
      // Store refresh token if available
      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token)
      }
      
      // Clean up
      localStorage.removeItem('spotify_code_verifier')
      localStorage.removeItem('spotify_auth_state')
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
      
      return true
    } catch (error) {
      console.error('Token exchange error:', error)
      throw error
    }
  }
  
  isAuthenticated(): boolean {
    return this.accessToken !== null && 
           this.tokenExpiry !== null && 
           Date.now() < this.tokenExpiry
  }
  
  private async refreshAccessToken(): Promise<void> {
    const refreshToken = localStorage.getItem('spotify_refresh_token')
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Token refresh failed')
      }
      
      const data = await response.json()
      this.saveTokenToStorage(data.access_token, data.expires_in)
      
      if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token)
      }
    } catch (error) {
      // Clear tokens on refresh failure
      this.accessToken = null
      localStorage.removeItem('spotify_access_token')
      localStorage.removeItem('spotify_token_expiry')
      localStorage.removeItem('spotify_refresh_token')
      throw error
    }
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
        // Try to refresh the token
        try {
          await this.refreshAccessToken()
          // Retry the request
          const retryResponse = await fetch(`https://api.spotify.com/v1${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          })
          
          if (!retryResponse.ok) {
            throw new Error(`Spotify API error: ${retryResponse.statusText}`)
          }
          
          return retryResponse.json()
        } catch (refreshError) {
          this.accessToken = null
          localStorage.removeItem('spotify_access_token')
          localStorage.removeItem('spotify_token_expiry')
          throw new Error('Token expired and refresh failed')
        }
      }
      throw new Error(`Spotify API error: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  async getCurrentUser(): Promise<SpotifyUser> {
    return this.fetchSpotify<SpotifyUser>('/me')
  }
  
  async getUserPlaylists(limit: number = 50): Promise<SimplifiedPlaylist[]> {
    const response = await this.fetchSpotify<{ items: SimplifiedPlaylist[] }>(
      `/me/playlists?limit=${limit}`
    )
    return response.items
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
  
  logout(): void {
    this.accessToken = null
    this.tokenExpiry = null
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_token_expiry')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_code_verifier')
    localStorage.removeItem('spotify_auth_state')
  }
}