export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string; id: string }[]
  album: {
    name: string
    images: { url: string; height: number; width: number }[]
  }
  duration_ms: number
  preview_url: string | null
  uri: string
}

export interface SpotifyAudioFeatures {
  id: string
  tempo: number
  key: number
  mode: number // 0 = minor, 1 = major
  time_signature: number
  danceability: number
  energy: number
  loudness: number
  speechiness: number
  acousticness: number
  instrumentalness: number
  liveness: number
  valence: number
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: { url: string }[]
  tracks: {
    total: number
    items: {
      track: SpotifyTrack
    }[]
  }
  owner?: {
    display_name: string
    id: string
  }
}

export interface CamelotKey {
  key: number
  mode: number
  camelotCode: string
  musicalKey: string
}

export interface SpotifyUser {
  id: string
  display_name: string
  email: string
  images: { url: string; height: number; width: number }[]
  country: string
  product: string
}

export interface SimplifiedPlaylist {
  id: string
  name: string
  description: string | null
  images: { url: string }[]
  tracks: {
    total: number
  }
  owner: {
    display_name: string
    id: string
  }
  public: boolean
}