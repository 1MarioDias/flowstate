<template>
  <div class="relative">
    <div class="flex items-center space-x-4 p-6 bg-neutral-900 rounded-2xl border border-neutral-700">
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
                 focus:border-transparent transition-all duration-200"
          @paste="handlePaste"
        >
      </div>
      <button
        @click="analyzePlaylist"
        :disabled="!isValidUrl"
        class="px-8 py-3 bg-gradient-to-r from-primary to-accent rounded-xl 
               text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed
               hover:shadow-lg hover:shadow-primary/25 transition-all duration-200
               transform hover:scale-105 active:scale-95"
      >
        <span v-if="!isAnalyzing">Analyze</span>
        <div v-else class="flex items-center space-x-2">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Analyzing...</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSpotify } from '@/composables/useSpotify'

const { analyzePlaylistFromUrl } = useSpotify()

const playlistUrl = ref('')
const isAnalyzing = ref(false)

const isValidUrl = computed(() => {
  return playlistUrl.value.includes('open.spotify.com/playlist/')
})

const analyzePlaylist = async () => {
  if (!isValidUrl.value) return
  
  isAnalyzing.value = true
  try {
    const result = await analyzePlaylistFromUrl(playlistUrl.value)
    // Handle successful analysis
  } catch (error) {
    // Handle error
  } finally {
    isAnalyzing.value = false
  }
}
</script>
