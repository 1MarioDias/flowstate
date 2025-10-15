<script setup lang="ts">
import { onMounted } from 'vue'
import { usePlaylistStore } from './stores/playlistStore'
import HeroSection from './components/layout/HeroSection.vue'

const playlistStore = usePlaylistStore()

onMounted(async () => {
  // Handle Spotify OAuth callback (PKCE flow uses query params, not hash)
  if (window.location.search.includes('code=')) {
    try {
      await playlistStore.handleCallback()
    } catch (error) {
      console.error('Callback handling failed:', error)
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-neutral-950">
    <HeroSection />
  </div>
</template>