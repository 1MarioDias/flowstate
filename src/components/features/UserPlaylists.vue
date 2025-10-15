<script setup lang="ts">
import { computed } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'

const playlistStore = usePlaylistStore()

const analyzeUserPlaylist = async (playlistId: string) => {
  try {
    await playlistStore.analyzePlaylistById(playlistId)
  } catch (err) {
    console.error('Failed to analyze playlist:', err)
  }
}
</script>

<template>
  <div v-if="playlistStore.isAuthenticated && playlistStore.userPlaylists.length > 0" class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-semibold text-white">Your Playlists</h3>
      <span class="text-sm text-neutral-400">{{ playlistStore.userPlaylists.length }} playlists</span>
    </div>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
      <div
        v-for="playlist in playlistStore.userPlaylists"
        :key="playlist.id"
        class="group p-4 bg-neutral-900/50 hover:bg-neutral-800/70 rounded-xl border border-neutral-700 hover:border-primary/50 transition-all duration-200"
      >
        <div class="flex items-start gap-3">
          <img
            v-if="playlist.images[0]"
            :src="playlist.images[0].url"
            :alt="playlist.name"
            class="w-16 h-16 rounded-lg shadow-lg"
          >
          <div v-else class="w-16 h-16 rounded-lg bg-neutral-800 flex items-center justify-center text-2xl">
            🎵
          </div>
          
          <div class="flex-1 min-w-0">
            <h4 class="text-white font-medium truncate mb-1">{{ playlist.name }}</h4>
            <p class="text-neutral-400 text-xs truncate mb-2">
              {{ playlist.tracks.total }} tracks • {{ playlist.owner.display_name }}
            </p>
            
            <button
              @click="analyzeUserPlaylist(playlist.id)"
              :disabled="playlistStore.isAnalyzing"
              class="px-3 py-1.5 bg-primary hover:bg-primary/80 disabled:bg-neutral-700 rounded-lg 
                     text-white text-xs font-medium transition-colors disabled:cursor-not-allowed
                     group-hover:shadow-lg group-hover:shadow-primary/25"
            >
              <span v-if="!playlistStore.isAnalyzing">Analyze</span>
              <span v-else>Analyzing...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>