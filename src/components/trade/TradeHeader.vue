<template>
  <div>
    <!-- Mode Switch -->
    <div class="bg-base-200 border-b border-base-300 sticky top-0 z-[40]">
      <div class="join w-full rounded-none">
        <button 
          class="join-item btn rounded-none border-0 flex-1 hover:bg-success/80"
          :class="{
            'bg-success text-white': isBuyMode,
            'btn-ghost': !isBuyMode,
            'opacity-50 cursor-not-allowed': isPurchasing
          }"
          @click="setMode(true)"
          :disabled="isPurchasing"
        >
          Buy
        </button>
        <button 
          class="join-item btn rounded-none border-0 flex-1 hover:bg-error/80"
          :class="{
            'bg-error text-white': !isBuyMode,
            'btn-ghost': isBuyMode,
            'opacity-50 cursor-not-allowed': isPurchasing
          }"
          @click="setMode(false)"
          :disabled="isPurchasing"
        >
          Sell
        </button>
      </div>
    </div>
    
    <!-- Header with Title and Purchase Button -->
    <div class="sticky top-[48px] bg-base-200 p-4 z-[30] shadow-lg border-b border-base-300">
      <div class="flex justify-between items-center gap-4 max-w-3xl mx-auto w-full">
        <h2 class="text-xl font-bold">{{ isBuyMode ? 'Purchase Dogs' : 'Sell Dogs' }}</h2>
        <button 
          class="btn min-w-[120px]"
          :class="{
            'btn-success approving-btn': isBuyMode && isPurchasing,
            'btn-error approving-btn': !isBuyMode && isPurchasing,
            'btn-success': isBuyMode && !isPurchasing,
            'btn-error': !isBuyMode && !isPurchasing
          }"
          :disabled="isDisabled"
          @click="handlePurchase"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isBuyMode: {
    type: Boolean, 
    default: true
  },
  isPurchasing: {
    type: Boolean,
    default: false
  },
  isDisabled: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: 'Purchase'
  }
});

const emit = defineEmits(['update:mode', 'purchase']);

function setMode(value) {
  emit('update:mode', value);
}

function handlePurchase() {
  emit('purchase');
}
</script>

<style scoped>
/* Animated border effect for the purchase/sell button */
.approving-btn {
  position: relative;
  border: none !important;
  z-index: 1;
  overflow: hidden;
}

.btn-success.approving-btn::before {
  content: "";
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  z-index: -1;
  background: linear-gradient(90deg, 
    rgba(34, 197, 94, 0.8), 
    rgba(16, 185, 129, 0.8), 
    rgba(5, 150, 105, 0.8), 
    rgba(16, 185, 129, 0.8),
    rgba(34, 197, 94, 0.8));
  background-size: 300% 100%;
  border-radius: 0.375rem;
  animation: shimmer 3s ease-in-out infinite alternate;
}

.btn-error.approving-btn::before {
  content: "";
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  z-index: -1;
  background: linear-gradient(90deg, 
    rgba(239, 68, 68, 0.8), 
    rgba(220, 38, 38, 0.8), 
    rgba(185, 28, 28, 0.8),
    rgba(220, 38, 38, 0.8), 
    rgba(239, 68, 68, 0.8));
  background-size: 300% 100%;
  border-radius: 0.375rem;
  animation: shimmer 3s ease-in-out infinite alternate;
}

@keyframes shimmer {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}
</style> 