<template>
  <!-- First Section -->
  <section class="flex flex-col lg:flex-row relative z-[2]">
    <!-- Left side with info -->
    <TradeInfo />

    <!-- Token List on the right side -->
    <TokenList
      :tokens="supportedTokens"
      :tokenAmounts="tokenAmounts"
      :isBuyMode="isBuyMode"
      :isConnected="isConnected"
      :tokenApprovals="tokenApprovals"
      :loadingApprovals="loadingApprovals"
      :isPurchasing="isPurchasing"
      :tokenBalances="tokenBalances"
      :formattedPrices="formattedPrices"
      :pricesLoading="pricesLoading"
      :isPurchaseDisabled="isPurchaseDisabled"
      :purchaseButtonText="purchaseButtonText"
      :activeRows="activeRows"
      @update:amount="handleAmountUpdate"
      @approve="approveToken"
      @set-max="handleSetMax"
      @update:mode="isBuyMode = $event"
      @purchase="handlePurchase"
      @set-active="setFocusedToken"
      @blur="handleInputBlur"
    />
  </section>

  <!-- Success modal -->
  <SuccessModal
    :show="showSuccessModal"
    :isBuyMode="isBuyMode"
    :result="transactionResult"
    @close="showSuccessModal = false"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { supportedTokens } from '../config/supportedToken'
import { supportedTokens as contracts } from '../config/contracts'
import { useWeb3 } from '../composables/useWeb3'
import { web3Utils } from '../composables/web3Utils'
import { swapperUtils } from '../composables/swapperUtils'
import swapperABI from '../config/swapperABI.json'
import Decimal from 'decimal.js'
import { knownTokens } from '../config/knownTokens'
import { useQuoterV2, formatTokenPrice } from '../composables/quoterV2'

// Import composables
import { useTradeState } from '../composables/trade/useTradeState'
import { useTradeValidation } from '../composables/trade/useTradeValidation'
import { useTokenData } from '../composables/trade/useTokenData'
import { useTransactions } from '../composables/trade/useTransactions'
import { useNetworkState } from '../composables/trade/useNetworkState'
import { useTradeUI } from '../composables/trade/useTradeUI'

// Import components
import TradeInfo from '../components/trade/TradeInfo.vue'
import TokenList from '../components/trade/TokenList.vue'
import SuccessModal from '../components/trade/SuccessModal.vue'

const { isConnected, address, web3, chainId } = useWeb3()

// Setup composables
const { isBuyMode, buyAmounts, sellAmounts, tokenAmounts, handleAmountUpdate, resetAmounts } = useTradeState()
const { tokenBalances, tokenApprovals, loadingApprovals, loadTokenData, approveToken, setMaxAmount } = useTokenData(web3, address, isConnected)
const { showNetworkDialog, isCorrectNetwork, checkChainId } = useNetworkState(web3, isConnected)
const { hasValidInput } = useTradeValidation(tokenAmounts, tokenBalances, isBuyMode)
const { isPurchasing, transactionResult, executePurchase, executeSell } = useTransactions(web3, address, isConnected)
const { 
  activeRows, 
  showSuccessModal, 
  setFocusedToken, 
  handleBlur, 
  purchaseButtonText, 
  isPurchaseDisabled 
} = useTradeUI(isConnected, isCorrectNetwork, isPurchasing, isBuyMode, hasValidInput)

// Handle setting max amount
const handleSetMax = (tokenAddress) => {
  sellAmounts.value[tokenAddress] = setMaxAmount(tokenAddress)
}

// Handle input blur event
const handleInputBlur = (address) => {
  handleBlur(address, tokenAmounts.value)
}

// Price fetching
const { tokenPrices, isLoading: pricesLoading, fetchAllTokenPrices } = useQuoterV2(web3)

// Formatted prices
const formattedPrices = computed(() => {
  return Object.entries(tokenPrices.value).reduce((acc, [address, price]) => {
    acc[address] = formatTokenPrice(price)
    return acc
  }, {})
})

// Handle purchase button click
const handlePurchase = async () => {
  if (!isCorrectNetwork.value) {
    showNetworkDialog.value = true
    return
  }

  let result = null
  
  if (isBuyMode.value) {
    result = await executePurchase(buyAmounts, resetAmounts, loadTokenData)
  } else {
    result = await executeSell(sellAmounts, resetAmounts, loadTokenData)
  }
  
  if (result) {
    transactionResult.value = result
    showSuccessModal.value = true
  }
}

// Watch for wallet connection
watch(isConnected, async (newValue) => {
  if (newValue) {
    await checkChainId()
    if (isCorrectNetwork.value) {
      await loadTokenData()
    }
  } else {
    // Reset states when disconnected
    tokenBalances.value = {}
    tokenApprovals.value = {}
  }
})

// Watch for chain ID changes
watch(chainId, async (newChainId) => {
  if (isConnected.value) {
    await checkChainId()
    if (isCorrectNetwork.value) {
      await loadTokenData()
      await fetchAllTokenPrices()
    }
  }
})

// Watch for changes in token amounts
watch(tokenAmounts, (newAmounts) => {
  Object.entries(newAmounts).forEach(([address, amount]) => {
    if (amount && amount !== '0' && amount !== '') {
      activeRows.value.add(address)
    } else {
      activeRows.value.delete(address)
    }
  })
}, { deep: true })

// Price refresh interval
let priceRefreshInterval = null

// Setup on component mount
onMounted(() => {
  // Initial fetch when component mounts
  if (web3.value) {
    fetchAllTokenPrices()
    checkChainId()
  }
  
  // Setup 30-second interval for price refresh
  priceRefreshInterval = setInterval(async () => {
    if (web3.value) {
      await fetchAllTokenPrices()
    }
  }, 30000) // 30 seconds
})

// Cleanup on component unmount
onUnmounted(() => {
  if (priceRefreshInterval) {
    clearInterval(priceRefreshInterval)
  }
})

// Update when web3 changes
watch([web3], async ([newWeb3]) => {
  if (newWeb3) {
    await fetchAllTokenPrices()
    await checkChainId()
    
    // Reset interval when web3 changes
    if (priceRefreshInterval) {
      clearInterval(priceRefreshInterval)
    }
    priceRefreshInterval = setInterval(async () => {
      if (web3.value) {
        await fetchAllTokenPrices()
      }
    }, 30000)
  }
})
</script>

<style scoped>
/* Hide number input spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Background container */
.absolute {
  transition: opacity 0.3s ease-in-out;
}

/* Floating animation */
@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(var(--move-x1), var(--move-y1)); }
  66% { transform: translate(var(--move-x2), var(--move-y2)); }
}

.floating-circle {
  animation: float var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  animation-play-state: paused;
  transition: all 0.2s ease-in-out;
}

/* Trigger animation on hover/focus or when row is active */
.token-row:hover .floating-circle,
.token-row:has(:focus) .floating-circle,
.row-active .floating-circle {
  animation-play-state: running;
}

/* Background hover effect */
.token-row:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Add border color for dark mode */
.token-row {
  border-color: rgba(255, 255, 255, 0.1);
}

/* Add styles for mode switch */
.join {
  display: flex;
  overflow: hidden;
}

.join-item {
  flex: 1;
  min-height: 3rem;
}

/* Remove button borders between items */
.join-item:not(:last-child) {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

/* Update hover effects for mode switch */
.join-item:hover {
  opacity: 0.9;
}

/* Smooth transition for color changes */
.join-item {
  flex: 1;
  min-height: 3rem;
  transition: all 0.2s ease-in-out;
}

/* Split valid input styles for buy and sell modes */
.valid-input-buy {
  border-left: 4px solid rgba(var(--success), 0.2);
  background-color: rgba(var(--success), 0.05);
}

.valid-input-buy:hover {
  background-color: rgba(var(--success), 0.1) !important;
}

/* Add active state for buy mode */
.row-active.valid-input-buy {
  border-left: 4px solid theme('colors.success');
}

.valid-input-sell {
  border-left: 4px solid rgba(var(--error), 0.2);
  background-color: rgba(var(--error), 0.05);
}

.valid-input-sell:hover {
  background-color: rgba(var(--error), 0.1) !important;
}

/* Add active state for sell mode */
.row-active.valid-input-sell {
  border-left: 4px solid theme('colors.error');
}

@keyframes borderPulse {
  0% {
    border-color: rgba(147, 51, 234, 0.3);
  }
  50% {
    border-color: rgba(147, 51, 234, 0.8);
  }
  100% {
    border-color: rgba(147, 51, 234, 0.3);
  }
}

/* Update approving-btn styles */
.approving-btn {
  border: 2px solid;
  animation: borderPulse 1.5s ease-in-out infinite;
  pointer-events: none;
  opacity: 0.9;
}

/* Add specific colors for purchase button states */
.btn-success.approving-btn {
  border-color: rgba(72, 199, 142, 0.5); /* success color */
  animation-name: successPulse;
}

.btn-error.approving-btn {
  border-color: rgba(239, 68, 68, 0.5); /* error color */
  animation-name: errorPulse;
}

@keyframes successPulse {
  0% {
    border-color: rgba(72, 199, 142, 0.3);
  }
  50% {
    border-color: rgba(72, 199, 142, 0.8);
  }
  100% {
    border-color: rgba(72, 199, 142, 0.3);
  }
}

@keyframes errorPulse {
  0% {
    border-color: rgba(239, 68, 68, 0.3);
  }
  50% {
    border-color: rgba(239, 68, 68, 0.8);
  }
  100% {
    border-color: rgba(239, 68, 68, 0.3);
  }
}

/* Add styles for MAX button */
.no-animation {
  transform: translateY(-50%) !important;
}

.no-animation:active {
  transform: translateY(-50%) !important;
}

/* Update MAX button styles */
.max-btn {
  transform: translateY(-50%) !important;
  transition: background-color 0.15s ease, color 0.15s ease;
  font-size: 0.7rem;
  line-height: 1.5;
  height: 20px;
  background: rgba(255, 255, 255, 0.05);
}

/* Add padding for input to prevent overlap with MAX button */
.input[type="number"] {
  padding-right: 3.5rem !important;
}

/* Add responsive styles */
@media (max-width: 1024px) {
  .token-row {
    padding: 1rem;
  }
  
  .floating-circle {
    display: none;
  }
}

@media (max-width: 640px) {
  .token-row {
    padding: 0.75rem;
  }
  
  .max-btn {
    height: 24px;
  }
  
  .input[type="number"] {
    font-size: 0.875rem;
  }
}

/* Z-index values */
:root {
  --navbar-z-index: 9999;      /* Navbar and its menu highest */
  --modal-z-index: 90;         /* Modal below navbar */
  --menu-z-index: 80;          /* Menu below modal */
  --mode-switch-z-index: 40;   /* Mode switch below menu */
  --header-z-index: 30;        /* Header below mode switch */
  --content-z-index: 20;       /* Content below header */
  --list-container-z-index: 10; /* List container lowest */
}

/* Token list container */
.token-list-container {
  position: relative;
  z-index: 1;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(24, 24, 27, 0.3); /* Adjust color to match your theme */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

/* Token row styles for glass effect */
.token-row {
  background: rgba(255, 255, 255, 0.01);
  border-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.token-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Glass effect for mode switch and header */
.bg-base-200 {
  background: rgba(24, 24, 27, 0.5) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style>
