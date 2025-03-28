<template>
  <div class="w-full lg:w-1/2 flex flex-col border-t lg:border-t-0 lg:border-l border-base-300 relative z-[1] token-list-container backdrop-blur-md bg-base-200/30 order-1 lg:order-2">
    <!-- Trade header (buy/sell toggle and action button) -->
    <TradeHeader
      :isBuyMode="isBuyMode"
      :isPurchasing="isPurchasing"
      :isDisabled="isPurchaseDisabled"
      :buttonText="purchaseButtonText"
      @update:mode="updateMode"
      @purchase="handlePurchase"
    />
    
    <!-- Scrollable Token List -->
    <div class="overflow-y-auto relative z-[20]">
      <div class="max-w-3xl mx-auto w-full">
        <TokenRow
          v-for="token in tokens" 
          :key="token.address"
          :token="token"
          :amount="tokenAmounts[token.address]"
          :isBuyMode="isBuyMode"
          :isConnected="isConnected"
          :isApproved="tokenApprovals[token.address]"
          :isApproving="loadingApprovals[token.address]"
          :isPurchasing="isPurchasing"
          :balance="tokenBalances[token.address]"
          :price="formattedPrices[token.address]"
          :pricesLoading="pricesLoading"
          :isActive="isRowActive(token.address)"
          @update:amount="updateAmount(token.address, $event)"
          @approve="approveToken"
          @set-max="setMaxAmount"
          @set-active="setFocusedToken"
          @blur="handleBlur"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import TokenRow from './TokenRow.vue';
import TradeHeader from './TradeHeader.vue';

const props = defineProps({
  tokens: {
    type: Array,
    required: true
  },
  tokenAmounts: {
    type: Object,
    required: true
  },
  isBuyMode: {
    type: Boolean,
    default: true
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  tokenApprovals: {
    type: Object,
    default: () => ({})
  },
  loadingApprovals: {
    type: Object,
    default: () => ({})
  },
  isPurchasing: {
    type: Boolean,
    default: false
  },
  tokenBalances: {
    type: Object,
    default: () => ({})
  },
  formattedPrices: {
    type: Object,
    default: () => ({})
  },
  pricesLoading: {
    type: Boolean,
    default: false
  },
  isPurchaseDisabled: {
    type: Boolean,
    default: false
  },
  purchaseButtonText: {
    type: String,
    default: 'Purchase'
  },
  activeRows: {
    type: Set,
    default: () => new Set()
  }
});

const emit = defineEmits([
  'update:amount', 
  'approve', 
  'set-max', 
  'update:mode',
  'purchase',
  'set-active',
  'blur'
]);

// Methods to pass events up to parent
function updateAmount(address, value) {
  emit('update:amount', { address, value });
}

function approveToken(address) {
  emit('approve', address);
}

function setMaxAmount(address) {
  emit('set-max', address);
}

function updateMode(value) {
  emit('update:mode', value);
}

function handlePurchase() {
  emit('purchase');
}

function isRowActive(address) {
  return props.activeRows.has(address);
}

function setFocusedToken(address) {
  emit('set-active', address);
}

function handleBlur(address) {
  emit('blur', address);
}
</script> 