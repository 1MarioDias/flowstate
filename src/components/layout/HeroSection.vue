<script setup lang="ts">
import { ref } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'
import PlaylistInput from '../ui/PlaylistInput.vue'
import AuthButton from '../ui/AuthButton.vue'
import AnalysisResults from '../features/AnalysisResults.vue'

const playlistStore = usePlaylistStore()

const samplePlaylistUrl = 'https://open.spotify.com/playlist/3wid7WMi2NuMiyYWZZjxTu?si=627360dd7a9345e9'

const loadSamplePlaylist = () => {
  if (playlistStore.isAuthenticated) {
    playlistStore.analyzePlaylist(samplePlaylistUrl)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-purple-950 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0">
      <div class="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
    </div>
    
    <!-- Main Content -->
    <div class="relative z-10 container mx-auto px-6 py-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-12">
        <div>
          <h1 class="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FlowState
          </h1>
          <p class="text-neutral-400 mt-2">AI-Powered DJ Playlist Optimization</p>
        </div>
        <AuthButton />
      </div>
      
      <!-- Hero Section (show when no data) -->
      <div v-if="!playlistStore.hasData" class="text-center max-w-4xl mx-auto">
        <!-- Value Proposition -->
        <div class="mb-12">
          <h2 class="text-3xl font-semibold text-white mb-6">
            Transform Your Playlists into Perfect DJ Sets
          </h2>
          <p class="text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Instantly analyze harmonic compatibility, optimize BPM transitions, 
            and reorder tracks for seamless mixing. No login required—just paste and play.
          </p>
        </div>
        
        <!-- Feature Highlights -->
        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <div class="p-6 bg-neutral-900/50 rounded-2xl border border-neutral-800">
            <div class="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              🎵
            </div>
            <h3 class="text-white font-semibold mb-2">Harmonic Analysis</h3>
            <p class="text-neutral-400 text-sm">Camelot Wheel integration for perfect key compatibility</p>
          </div>
          
          <div class="p-6 bg-neutral-900/50 rounded-2xl border border-neutral-800">
            <div class="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              ⚡
            </div>
            <h3 class="text-white font-semibold mb-2">Instant Results</h3>
            <p class="text-neutral-400 text-sm">Get optimized playlist recommendations in seconds</p>
          </div>
          
          <div class="p-6 bg-neutral-900/50 rounded-2xl border border-neutral-800">
            <div class="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              🎯
            </div>
            <h3 class="text-white font-semibold mb-2">Energy Flow</h3>
            <p class="text-neutral-400 text-sm">Intelligent BPM progression for natural transitions</p>
          </div>
        </div>
        
        <!-- Playlist Input -->
        <PlaylistInput />
        
        <!-- Demo/Sample -->
        <div class="mt-8">
          <p class="text-neutral-500 text-sm mb-4">Try with a sample playlist:</p>
          <button 
            class="text-accent hover:text-accent/80 underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!playlistStore.isAuthenticated"
            @click="loadSamplePlaylist"
          >
            Load Popular EDM Mix Example
          </button>
        </div>
      </div>
      
      <!-- Analysis Results (show when data available) -->
      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white">Analysis Results</h2>
          <button
            @click="playlistStore.reset"
            class="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-white text-sm 
                   transition-colors border border-neutral-600"
          >
            Analyze Another Playlist
          </button>
        </div>
        <AnalysisResults />
      </div>
    </div>
  </div>
</template>