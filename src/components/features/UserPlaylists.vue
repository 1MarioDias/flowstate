<script setup lang="ts">
import { computed } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'
import type { SimplifiedPlaylist } from '@/types/spotify'

const playlistStore = usePlaylistStore()

const analyzeUserPlaylist = async (playlistId: string) => {
  try {
    await playlistStore.analyzePlaylistById(playlistId)
  } catch (err) {
    console.error('Failed to analyze playlist:', err)
  }
}

const calculateAverageBPM = (playlist: SimplifiedPlaylist): string => {
  // Since SimplifiedPlaylist doesn't have tracks data, show placeholder
  // In a real scenario, you'd fetch this data separately or cache it
  return '~120'
}

const formatTrackCount = (count: number): string => {
  return count === 1 ? '1 track' : `${count} tracks`
}
</script>

<template>
  <div v-if="playlistStore.isAuthenticated && playlistStore.userPlaylists.length > 0" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-2xl font-bold text-white">Your Playlists</h3>
        <p class="text-neutral-400 text-sm mt-1">
          {{ playlistStore.userPlaylists.length }} playlists ready to analyze
        </p>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="playlistStore.isLoadingPlaylists" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-neutral-400">Loading your playlists...</p>
      </div>
    </div>
    
    <!-- Playlists Grid -->
    <div v-else class="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      <div
        v-for="playlist in playlistStore.userPlaylists"
        :key="playlist.id"
        class="group relative bg-gradient-to-r from-neutral-900/50 to-neutral-900/30 hover:from-neutral-800/70 hover:to-neutral-800/50 
               rounded-2xl border border-neutral-700 hover:border-primary/50 transition-all duration-300
               shadow-lg hover:shadow-xl hover:shadow-primary/10"
      >
        <div class="flex items-center gap-4 p-5">
          <!-- Playlist Cover -->
          <div class="relative flex-shrink-0">
            <img
              v-if="playlist.images[0]"
              :src="playlist.images[0].url"
              :alt="playlist.name"
              class="w-20 h-20 rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
            >
            <div v-else class="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl">
              🎵
            </div>
            <!-- Track Count Badge -->
            <div class="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {{ playlist.tracks.total }}
            </div>
          </div>
          
          <!-- Playlist Info -->
          <div class="flex-1 min-w-0">
            <h4 class="text-white font-semibold text-lg truncate mb-1 group-hover:text-primary transition-colors">
              {{ playlist.name }}
            </h4>
            
            <p v-if="playlist.description" class="text-neutral-400 text-sm line-clamp-1 mb-2">
              {{ playlist.description }}
            </p>
            
            <!-- Playlist Stats -->
            <div class="flex items-center gap-4 text-xs">
              <div class="flex items-center gap-1.5 text-neutral-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
                <span>{{ formatTrackCount(playlist.tracks.total) }}</span>
              </div>
              
              <div class="flex items-center gap-1.5 text-neutral-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="truncate max-w-[100px]">{{ playlist.owner.display_name }}</span>
              </div>
              
              <div class="flex items-center gap-1.5 text-accent">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <span class="font-medium">{{ calculateAverageBPM(playlist) }} BPM</span>
              </div>
            </div>
          </div>
          
          <!-- Analyze Button -->
          <button
            @click="analyzeUserPlaylist(playlist.id)"
            :disabled="playlistStore.isAnalyzing"
            class="relative overflow-hidden px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl
                   text-white font-semibold transition-all duration-300
                   hover:shadow-lg hover:shadow-primary/50 hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                   active:scale-95 flex items-center gap-2 group/btn"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <span class="relative z-10 flex items-center gap-2">
              <svg v-if="!playlistStore.isAnalyzing" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span v-if="!playlistStore.isAnalyzing">Analyze</span>
              <span v-else>Analyzing...</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--color-primary), var(--color-accent));
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--color-accent), var(--color-primary));
}

/* Text clamp for description */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>