<template>
  <div class="modal z-[90]" :class="{ 'modal-open': show }">
    <div class="modal-box relative">
      <button 
        class="btn btn-sm btn-circle absolute right-2 top-2"
        @click="close"
      >
        ✕
      </button>
      <h3 class="font-bold text-lg mb-4">
        {{ isBuyMode ? 'Purchase Successful!' : 'Sell Successful!' }}
      </h3>
      
      <!-- Transaction Hash -->
      <div class="bg-base-200 rounded-lg p-3 mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm opacity-70">Transaction Hash:</span>
          <button 
            class="btn btn-ghost btn-xs"
            @click="copyTxHash"
            :class="{ 'text-success': copied }"
          >
            <i class="fas text-xs" :class="copied ? 'fa-check' : 'fa-copy'"></i>
          </button>
        </div>
        <a 
          :href="`https://bscscan.com/tx/${result.hash}`" 
          target="_blank"
          class="text-sm text-primary hover:text-primary-focus break-all"
        >
          {{ result.hash }}
        </a>
      </div>

      <!-- Token Details -->
      <div class="space-y-3">
        <template v-if="isBuyMode">
          <div class="flex justify-between items-center">
            <span class="text-sm opacity-70">Paid (including fee):</span>
            <span class="text-sm">{{ result.paid }} BNB</span>
          </div>
          <div class="flex justify-between items-center text-xs opacity-60">
            <span>Fee:</span>
            <span>{{ result.fee }} BNB</span>
          </div>
          <div v-for="token in result.tokens" :key="token.address">
            <div class="flex justify-between items-center">
              <span class="text-sm opacity-70">Received {{ token.symbol }}:</span>
              <span class="text-sm">{{ token.amount }}</span>
            </div>
          </div>
          <!-- Add ADOG Reward -->
          <div class="divider my-2"></div>
          <div class="bg-primary/10 rounded-lg p-3">
            <div class="flex items-center gap-2 mb-2">
              <img 
                src="../../assets/ADOG.png" 
                alt="ADOG" 
                class="w-5 h-5 rounded-full"
              />
              <span class="font-semibold text-primary">Reward</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm opacity-70">ADOG Tokens:</span>
              <span class="text-sm text-primary">10 ADOG</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div v-for="token in result.tokens" :key="token.address">
            <div class="flex justify-between items-center">
              <span class="text-sm opacity-70">Sold {{ token.symbol }}:</span>
              <span class="text-sm">{{ token.amount }}</span>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm opacity-70">Received:</span>
            <span class="text-sm">{{ result.received }} BNB</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isBuyMode: {
    type: Boolean,
    default: true
  },
  result: {
    type: Object,
    default: () => ({
      hash: '',
      paid: 0,
      received: 0,
      fee: 0,
      tokens: []
    })
  }
});

const emit = defineEmits(['close']);

const copied = ref(false);

function close() {
  emit('close');
}

function copyTxHash() {
  navigator.clipboard.writeText(props.result.hash)
    .then(() => {
      copied.value = true;
      setTimeout(() => { copied.value = false; }, 2000);
    })
    .catch(err => console.error('Failed to copy:', err));
}
</script> 