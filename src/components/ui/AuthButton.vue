<script setup lang="ts">
import { usePlaylistStore } from '@/stores/playlistStore'

const playlistStore = usePlaylistStore()

const handleAuth = async () => {
  if (!playlistStore.isAuthenticated) {
    await playlistStore.authenticate()
  } else {
    playlistStore.logout()
  }
}

const getUserImage = () => {
  return playlistStore.currentUser?.images[0]?.url || ''
}
</script>

<template>
  <button
    v-if="!playlistStore.isAuthenticated"
    @click="handleAuth"
    class="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-semibold 
           transition-all duration-200 transform hover:scale-105 active:scale-95
           flex items-center gap-2"
  >
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
    Connect with Spotify
  </button>
  
  <div v-else class="flex items-center gap-3">
    <!-- User Profile -->
    <div class="flex items-center gap-3 px-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded-xl">
      <img 
        v-if="getUserImage()"
        :src="getUserImage()"
        :alt="playlistStore.currentUser?.display_name"
        class="w-8 h-8 rounded-full"
      >
      <div v-else class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
        {{ playlistStore.currentUser?.display_name?.charAt(0).toUpperCase() }}
      </div>
      <span class="text-white text-sm font-medium">
        {{ playlistStore.currentUser?.display_name }}
      </span>
    </div>
    
    <!-- Connected Status -->
    <div class="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-600/50 rounded-xl">
      <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span class="text-green-400 text-sm font-medium">Connected</span>
    </div>
    
    <!-- Logout Button -->
    <button
      @click="handleAuth"
      class="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 text-sm 
             transition-colors border border-neutral-600"
    >
      Logout
    </button>
  </div>
</template>