<template>
  <footer class="relative z-[2] mt-16">
    <!-- Gradient Border -->
    <div class="h-1 w-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500"></div>
    
    <!-- Main Footer Content -->
    <div class="bg-base-200/50 backdrop-blur-sm">
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- About Section -->
          <div>
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
              <img src="../assets/ADOG.png" alt="ADOG" class="w-6 h-6 rounded-full" />
              AlwaysDog
            </h3>
            <p class="text-sm opacity-70">
              A revolutionary meme coin trading platform that allows you to buy or sell multiple dog-themed tokens in a single transaction.
            </p>
          </div>

          <!-- Contract -->
          <div>
            <h3 class="text-lg font-bold mb-4">Contract</h3>
            <div class="space-y-3">
              <!-- ADOG Contract -->
              <div class="bg-base-300/50 p-3 rounded-lg">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <span class="text-sm font-medium">ADOG Token:</span>
                  <button 
                    class="btn btn-ghost btn-xs"
                    @click="copyContract('adog')"
                    :class="{ 'text-success': copied === 'adog' }"
                  >
                    <i class="fas text-xs" :class="copied === 'adog' ? 'fa-check' : 'fa-copy'"></i>
                  </button>
                </div>
                <span class="text-xs opacity-70 break-all">
                  {{ contracts.adog.address }}
                </span>
              </div>

              <!-- Swapper Contract -->
              <div class="bg-base-300/50 p-3 rounded-lg">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <span class="text-sm font-medium">Swapper Contract:</span>
                  <button 
                    class="btn btn-ghost btn-xs"
                    @click="copyContract('swapper')"
                    :class="{ 'text-success': copied === 'swapper' }"
                  >
                    <i class="fas text-xs" :class="copied === 'swapper' ? 'fa-check' : 'fa-copy'"></i>
                  </button>
                </div>
                <span class="text-xs opacity-70 break-all">
                  {{ contracts.swapper.address }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Media Links -->
        <div class="mt-8 flex justify-center gap-6">
          <a href="https://x.com/AlwaysDogDeFi" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-primary transition-colors">
            <i class="fab fa-twitter text-xl"></i>
            <span class="text-sm">Twitter</span>
          </a>
          <a href="https://www.youtube.com/channel/UCJ9S2_-OZNdvqvE_N9UHOVw" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 hover:text-primary transition-colors">
            <i class="fab fa-youtube text-xl"></i>
            <span class="text-sm">YouTube</span>
          </a>
        </div>

        <!-- Bottom Bar -->
        <div class="mt-8 pt-4 border-t border-base-300/50 text-center">
          <p class="text-sm opacity-70">
            © {{ currentYear }} AlwaysDog. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supportedTokens as contracts } from '../config/contracts'

const copied = ref(null)
const currentYear = computed(() => new Date().getFullYear())

const copyContract = async (type) => {
  try {
    await navigator.clipboard.writeText(contracts[type].address)
    copied.value = type
    setTimeout(() => {
      copied.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
/* Gradient animation */
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}
</style>
