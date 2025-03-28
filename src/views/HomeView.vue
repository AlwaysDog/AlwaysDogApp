<template>
  <div class="min-h-screen relative z-[1]">
    <!-- Add NetworkDialog component -->
    <NetworkDialog 
      :show="showNetworkDialog"
      @close="showNetworkDialog = false"
    />

    <!-- Add floating paw prints -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div 
        v-for="i in 15" 
        :key="i"
        class="absolute paw-print"
        :style="getPawStyle(i)"
      >
        <img 
          src="../assets/paw-print.svg" 
          :class="i % 2 === 0 ? 'w-16 h-16' : 'w-24 h-24'"
          alt="paw print" 
        />
      </div>
    </div>

    <!-- Trade Component (replaces First Section) -->
    <Trade />

    <!-- ADOG Section -->
    <section id="adog-section" class="container mx-auto p-4 lg:p-8 mt-8">
      <ADOG />
    </section>

    <!-- Risk Section -->
    <section id="risk-section" class="container mx-auto p-4 lg:p-8">
      <Risk />
    </section>

    <!-- Add PageBottom component -->
    <PageBottom />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ADOG from './ADOG.vue'
import Risk from './Risk.vue'
import NetworkDialog from './NetworkDialog.vue'
import PageBottom from './PageBottom.vue'
import Trade from './Trade.vue'

// Show network dialog state
const showNetworkDialog = ref(false)

// Add paw print animation logic
const getPawStyle = (index) => {
  const delay = Math.random() * -30
  const duration = 20 + Math.random() * 15
  const startX = Math.random() * 100
  const startY = Math.random() * 100
  const rotation = Math.random() * 360
  
  return {
    left: `${startX}%`,
    top: `${startY}%`,
    '--delay': `${delay}s`,
    '--duration': `${duration}s`,
    '--rotation': `${rotation}deg`
  }
}
</script>

<style scoped>
/* Update paw print styles */
.paw-print {
  animation: float-paw var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  opacity: 0;
}

.paw-print img {
  color: rgba(59, 130, 246, 0.15); /* Bright blue with low opacity */
  transform: rotate(var(--rotation));
}

@keyframes float-paw {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  25% {
    transform: translate(-200px, -100px) rotate(-45deg);
    opacity: 0.4;
  }
  50% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.2;
  }
  75% {
    transform: translate(200px, 100px) rotate(45deg);
    opacity: 0.3;
  }
}
</style> 