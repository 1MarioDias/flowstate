<script setup lang="ts">
import { computed } from 'vue'
import { usePlaylistStore } from '@/stores/playlistStore'

const playlistStore = usePlaylistStore()

const averageTempo = computed(() => {
  return playlistStore.analysis?.averageTempo.toFixed(1) || '0'
})

const averageEnergy = computed(() => {
  return ((playlistStore.analysis?.averageEnergy || 0) * 100).toFixed(0)
})

const topKeys = computed(() => {
  if (!playlistStore.analysis) return []
  
  const sorted = Object.entries(playlistStore.analysis.keyDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
  
  return sorted
})

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${seconds.padStart(2, '0')}`
}
</script>

<template>
  <div v-if="playlistStore.hasData" class="space-y-6">
    <!-- Playlist Header -->
    <div class="flex items-start gap-6 p-6 bg-neutral-900/70 backdrop-blur-sm rounded-2xl border border-neutral-700">
      <img 
        v-if="playlistStore.currentPlaylist?.images[0]"
        :src="playlistStore.currentPlaylist.images[0].url"
        :alt="playlistStore.currentPlaylist.name"
        class="w-32 h-32 rounded-xl shadow-2xl"
      >
      <div class="flex-1">
        <h2 class="text-3xl font-bold text-white mb-2">
          {{ playlistStore.currentPlaylist?.name }}
        </h2>
        <p class="text-neutral-400 mb-4">
          {{ playlistStore.currentPlaylist?.description }}
        </p>
        <div class="flex items-center gap-4 text-sm text-neutral-400">
          <span>{{ playlistStore.trackCount }} tracks</span>
          <span>•</span>
          <span>{{ averageTempo }} BPM avg</span>
          <span>•</span>
          <span>{{ averageEnergy }}% energy</span>
        </div>
      </div>
    </div>

    <!-- Analysis Stats -->
    <div class="grid md:grid-cols-3 gap-4">
      <!-- Average Tempo -->
      <div class="p-6 bg-neutral-900/70 backdrop-blur-sm rounded-2xl border border-neutral-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-neutral-400 text-sm">Average Tempo</span>
          <span class="text-2xl">🎵</span>
        </div>
        <p class="text-3xl font-bold text-white">{{ averageTempo }} <span class="text-lg text-neutral-400">BPM</span></p>
      </div>

      <!-- Average Energy -->
      <div class="p-6 bg-neutral-900/70 backdrop-blur-sm rounded-2xl border border-neutral-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-neutral-400 text-sm">Average Energy</span>
          <span class="text-2xl">⚡</span>
        </div>
        <p class="text-3xl font-bold text-white">{{ averageEnergy }}<span class="text-lg text-neutral-400">%</span></p>
      </div>

      <!-- Track Count -->
      <div class="p-6 bg-neutral-900/70 backdrop-blur-sm rounded-2xl border border-neutral-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-neutral-400 text-sm">Total Tracks</span>
          <span class="text-2xl">📊</span>
        </div>
        <p class="text-3xl font-bold text-white">{{ playlistStore.trackCount }}</p>
      </div>
    </div>

    <!-- Key Distribution -->
    <div class="p-6 bg-neutral-900/70 backdrop-blur-sm rounded-2xl border border-neutral-700">
      <h3 class="text-xl font-semibold text-white mb-4">Top Keys (Camelot)</h3>
      <div class="grid grid-cols-3 gap-4">
        <div v-for="[key, count] in topKeys" :key="key" class="text-center p-4 bg-neutral-800/50 rounded-xl">
          <p class="text-2xl font-bold text-primary mb-1">{{ key }}</p>
          <p class="text-sm text-neutral-400">{{ count }} tracks</p>
        </div>
      </div>
    </div>

    <!-- Track List -->
    <div class="p-6 bg-neutral-900/70 backdrop-blur-sm rounded-2xl border border-neutral-700">
      <h3 class="text-xl font-semibold text-white mb-4">Tracks Analysis</h3>
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div 
          v-for="(track, index) in playlistStore.analysis?.tracks" 
          :key="track.track.id"
          class="flex items-center gap-4 p-3 bg-neutral-800/50 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <span class="text-neutral-400 font-mono text-sm w-8">{{ (index + 1).toString().padStart(2, '0') }}</span>
          <img 
            :src="track.track.album.images[2]?.url || track.track.album.images[0]?.url"
            :alt="track.track.name"
            class="w-12 h-12 rounded"
          >
          <div class="flex-1 min-w-0">
            <p class="text-white font-medium truncate">{{ track.track.name }}</p>
            <p class="text-neutral-400 text-sm truncate">
              {{ track.track.artists.map(a => a.name).join(', ') }}
            </p>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <span class="px-2 py-1 bg-primary/20 text-primary rounded">
              {{ track.camelotKey.camelotCode }}
            </span>
            <span class="text-neutral-400">{{ track.audioFeatures.tempo.toFixed(0) }} BPM</span>
            <span class="text-neutral-400">{{ formatDuration(track.track.duration_ms) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>