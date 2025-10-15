<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'

const playlistStore = usePlaylistStore()

const playlistUrl = ref('')

const isValidUrl = computed(() => {
  return playlistUrl.value.includes('open.spotify.com/playlist/')
})

const analyzePlaylist = async () => {
  if (!isValidUrl.value) return
  
  try {
    await playlistStore.analyzePlaylist(playlistUrl.value)
  } catch (err) {
    console.error('Analysis failed:', err)
  }
}

const handlePaste = (event: ClipboardEvent) => {
  const text = event.clipboardData?.getData('text')
  if (text) {
    playlistUrl.value = text
  }
}
</script>

<template>
  <div class="relative">
    <div class="flex flex-col md:flex-row items-stretch md:items-end gap-4 p-6 bg-neutral-900/70 backdrop-blur-sm rounded-2xl border border-neutral-700">
      <div class="flex-1">
        <label class="block text-sm font-medium text-neutral-400 mb-2">
          Spotify Playlist URL
        </label>
        <input
          v-model="playlistUrl"
          type="url"
          placeholder="https://open.spotify.com/playlist/..."
          class="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-xl 
                 text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary 
                 focus:border-transparent transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="playlistStore.isAnalyzing"
          @paste="handlePaste"
          @keyup.enter="analyzePlaylist"
        >
      </div>
      <button
        @click="analyzePlaylist"
        :disabled="!isValidUrl || playlistStore.isAnalyzing || !playlistStore.isAuthenticated"
        class="px-8 py-3 bg-gradient-to-r from-primary to-accent rounded-xl 
               text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed
               hover:shadow-lg hover:shadow-primary/25 transition-all duration-200
               transform hover:scale-105 active:scale-95 whitespace-nowrap"
      >
        <span v-if="!playlistStore.isAnalyzing">Analyze</span>
        <div v-else class="flex items-center space-x-2">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Analyzing...</span>
        </div>
      </button>
    </div>
    
    <!-- Error Message -->
    <div v-if="playlistStore.error" class="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
      <p class="text-red-400 text-sm">{{ playlistStore.error }}</p>
    </div>
  </div>
</template>