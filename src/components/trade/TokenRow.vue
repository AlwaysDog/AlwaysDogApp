<template>
  <div 
    :class="[
      rowClasses,
      {
        'valid-input-buy': isBuyMode && isValid && isActive,
        'valid-input-sell': !isBuyMode && isValid && isActive
      }
    ]"
  >
    <!-- Background Image Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div 
        v-for="(circleData, i) in circleStyles" 
        :key="i"
        :style="getCircleStyle(token, circleData)"
        class="floating-circle"
        :class="{ 'animate-circle': isActive || (amount && parseFloat(amount) > 0) }"
      ></div>
    </div>

    <!-- Content (with relative positioning to stay above background) -->
    <div class="relative grid grid-cols-1 sm:grid-cols-[2fr,1fr] gap-4 items-center">
      <!-- Token Info Column -->
      <div class="flex flex-col gap-2 sm:gap-1">
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <img 
            :src="token.image" 
            :alt="token.name"
            class="w-8 h-8 rounded-full"
            onerror="this.src='https://placehold.co/32x32'"
          />
          <div class="flex flex-col">
            <div class="flex items-center gap-1">
              <span class="font-bold text-white">{{ token.name }}</span>
              <span class="text-xs font-light text-white tracking-wide">(${{ token.symbol }})</span>
            </div>
            <!-- Price display -->
            <div class="flex items-center gap-2">
              <span class="text-xs opacity-70">Price:</span>
              <span class="text-xs opacity-70">
                {{ pricesLoading ? 'Loading...' : `${formattedPrice} BNB` }}
              </span>
              <div v-if="pricesLoading" class="loading loading-spinner loading-xs"></div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <span class="text-sm opacity-70 mr-0">{{ shortenAddress(token.address) }}</span>
            <button 
              class="btn btn-ghost btn-xs h-6 min-h-0 px-1"
              @click="copyAddress"
              :class="{ 'text-success': copied }"
            >
              <i class="fas text-xs" :class="copied ? 'fa-check' : 'fa-copy'"></i>
            </button>
          </div>
          <!-- Vertical divider -->
          <div class="h-5 w-px bg-base-300"></div>
          <!-- Social Links -->
          <div class="flex gap-0.5">
            <a v-if="token.website" 
              :href="token.website" 
              target="_blank" 
              class="btn btn-ghost btn-xs p-1 min-h-0 h-6 text-white hover:text-primary"
            >
              <i class="fas fa-globe text-xs"></i>
            </a>
            <a v-if="token.twitter" 
              :href="token.twitter" 
              target="_blank" 
              class="btn btn-ghost btn-xs p-1 min-h-0 h-6 text-white hover:text-primary"
            >
              <i class="fab fa-twitter text-xs"></i>
            </a>
            <a v-if="token.telegram" 
              :href="token.telegram" 
              target="_blank" 
              class="btn btn-ghost btn-xs p-1 min-h-0 h-6 text-white hover:text-primary"
            >
              <i class="fab fa-telegram text-xs"></i>
            </a>
            <a v-if="token.discord" 
              :href="token.discord" 
              target="_blank" 
              class="btn btn-ghost btn-xs p-1 min-h-0 h-6 text-white hover:text-primary"
            >
              <i class="fab fa-discord text-xs"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- Purchase/Sell Amount Column -->
      <div class="form-control h-[72px]">
        <template v-if="!isBuyMode && !isApproved">
          <!-- Approve Button -->
          <div class="relative">
            <button 
              class="btn btn-sm h-8 min-h-0 w-full relative"
              :class="{
                'approving-btn': isApproving,
                'bg-purple-900/50 hover:bg-purple-800/50': !isApproving,
                'text-purple-200': true,
                'border-purple-700/50': !isApproving
              }"
              @click="approve"
              :disabled="!isConnected || isApproving"
            >
              {{ isApproving ? 'Approving...' : 'Approve' }}
            </button>
          </div>
          <label class="label py-1">
            <span class="label-text-alt text-xs opacity-60">
              Approve {{ token.symbol }} first
            </span>
          </label>
        </template>
        <template v-else>
          <div class="relative">
            <input 
              type="number" 
              :value="amount"
              @input="updateAmount($event.target.value)"
              placeholder="0"
              class="input input-bordered input-sm w-full pr-14"
              :class="{
                'input-error': isBuyMode 
                  ? (!isValidAmount(amount) && amount !== '0' && amount !== '')
                  : !isValidSellAmount(amount),
                'opacity-50': !isBuyMode && isPurchasing
              }"
              :min="0"
              :max="isBuyMode ? 2 : maxAmount"
              step="any"
              @blur="handleBlur"
              @focus="setActive"
              :disabled="!isBuyMode && isPurchasing"
            />
            <!-- Max button for sell mode -->
            <button 
              v-if="!isBuyMode"
              class="btn btn-xs btn-ghost absolute right-2 top-1/2 -translate-y-1/2 no-animation max-btn min-w-[40px] px-1"
              @click="setMax"
              :disabled="isPurchasing"
              :class="{ 'opacity-50 cursor-not-allowed': isPurchasing }"
            >
              MAX
            </button>
          </div>
          <label class="label py-1">
            <span 
              class="label-text-alt text-xs opacity-60"
              :class="{
                'text-error': isBuyMode 
                  ? (!isValidAmount(amount) && amount !== '0' && amount !== '')
                  : !isValidSellAmount(amount)
              }"
            >
              {{ isBuyMode 
                ? getValidationMessage(amount) 
                : getSellValidationMessage() 
              }}
            </span>
          </label>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Decimal from 'decimal.js';

const props = defineProps({
  token: {
    type: Object,
    required: true
  },
  amount: {
    type: String,
    default: '0'
  },
  isBuyMode: {
    type: Boolean,
    default: true
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isApproving: {
    type: Boolean,
    default: false
  },
  isPurchasing: {
    type: Boolean,
    default: false
  },
  balance: {
    type: Object,
    default: () => ({})
  },
  price: {
    type: String,
    default: '0'
  },
  pricesLoading: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
});

const emit = defineEmits([
  'update:amount', 
  'approve', 
  'set-max',
  'set-active',
  'blur'
]);

// Local state for copy function
const copied = ref(false);

// Constants for validation
const MIN_AMOUNT = 0.002;
const MAX_AMOUNT = 2;

// Computed values
const formattedPrice = computed(() => props.price);
const maxAmount = computed(() => props.balance?.formatted || 0);
const isValid = computed(() => {
  if (!props.amount || props.amount === '0' || props.amount === '') return false;
  return props.isBuyMode
    ? isValidAmount(props.amount)
    : isValidSellAmount(props.amount);
});

// Row styling
const rowClasses = computed(() => ({
  'token-row': true,
  'p-4 border-b border-base-300 transition-colors relative overflow-hidden': true,
  'row-active': props.isActive
}));

// Generate circle styles for background animation
const circleStyles = ref(generateRowCircles());

function generateRowCircles() {
  return Array.from({ length: 8 }, () => ({
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    size: 32,
    duration: 3 + Math.random() * 2,
    moveX1: Math.random() * 60 - 30,
    moveY1: Math.random() * 60 - 30,
    moveX2: Math.random() * 60 - 30,
    moveY2: Math.random() * 60 - 30,
    delay: Math.random() * -2
  }));
}

function getCircleStyle(token, circleData) {
  return {
    position: 'absolute',
    left: `${circleData.x}%`,
    top: `${circleData.y}%`,
    width: `${circleData.size}px`,
    height: `${circleData.size}px`,
    background: `url(${token.image}) center/cover`,
    borderRadius: '50%',
    '--move-x1': `${circleData.moveX1}%`,
    '--move-y1': `${circleData.moveY1}%`,
    '--move-x2': `${circleData.moveX2}%`,
    '--move-y2': `${circleData.moveY2}%`,
    '--duration': `${circleData.duration}s`,
    '--delay': `${circleData.delay}s`
  };
}

// Validation functions
function isValidAmount(amount) {
  if (!amount || amount === '0' || amount === 0) return true;
  const value = parseFloat(amount);
  return !isNaN(value) && value >= MIN_AMOUNT && value <= MAX_AMOUNT;
}

function getValidationMessage(amount) {
  if (!amount || amount === '0' || amount === 0) 
    return `Min: ${MIN_AMOUNT} BNB, Max: ${MAX_AMOUNT} BNB`;
  
  if (!isValidAmount(amount)) {
    const value = parseFloat(amount);
    if (value < MIN_AMOUNT) return `Minimum amount is ${MIN_AMOUNT} BNB`;
    if (value > MAX_AMOUNT) return `Maximum amount is ${MAX_AMOUNT} BNB`;
  }
  return `Min: ${MIN_AMOUNT} BNB, Max: ${MAX_AMOUNT} BNB`;
}

// Add a new ref to track if the MAX button was clicked
const wasMaxClicked = ref(false);

// Update the setMax function to track when MAX was clicked
function setMax() {
  wasMaxClicked.value = true;
  emit('set-max', props.token.address);
}

// Update the validation function to handle MAX button edge case
function isValidSellAmount(amount) {
  if (!amount || amount === '0') return true;
  
  // Special case - if MAX was clicked, always allow it
  if (wasMaxClicked.value && amount === props.amount) {
    return true;
  }
  
  try {
    const value = new Decimal(amount);
    const max = new Decimal(maxAmount.value);
    
    // More generous buffer for floating point imprecision
    const buffer = new Decimal('0.000000000000001');
    
    return value.gte(0) && (
      value.lte(max) || 
      value.minus(max).abs().lte(buffer) ||
      // Check if it's very close percentage wise for large numbers
      (max.gt(1000) && value.div(max).minus(1).abs().lt(0.0000001))
    );
  } catch (e) {
    console.error('Error in Decimal.js comparison:', e);
    return true; // Be permissive on error
  }
}

// Simplify the validation message to avoid confusion
function getSellValidationMessage() {
  try {
    // Use the props.balance.formatted but also show a note about precision
    const maxBalance = props.balance?.formatted || '0';
    return `Max: ~${maxBalance} tokens`;
  } catch (e) {
    return `Max: ${maxAmount.value} tokens`;
  }
}

// Reset wasMaxClicked when amount changes
watch(() => props.amount, () => {
  // Reset after a short delay to ensure validation happens
  setTimeout(() => {
    wasMaxClicked.value = false;
  }, 500);
});

// Helper methods
function shortenAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function copyAddress() {
  navigator.clipboard.writeText(props.token.address)
    .then(() => {
      copied.value = true;
      setTimeout(() => { copied.value = false; }, 2000);
    })
    .catch(err => console.error('Failed to copy:', err));
}

// Event handlers
function updateAmount(value) {
  emit('update:amount', value);
}

function approve() {
  emit('approve', props.token.address);
}

function setActive() {
  emit('set-active', props.token.address);
}

function handleBlur() {
  // If amount is empty or 0, set it to '0'
  if (!props.amount || props.amount === '' || parseFloat(props.amount) === 0) {
    emit('update:amount', '0');
  }
  emit('blur', props.token.address);
}
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

/* Add padding for input to prevent overlap with MAX button */
.input[type="number"] {
  padding-right: 3.5rem !important;
}

/* Fix MAX button position on click */
.max-btn {
  transform: translateY(-50%) !important;
  transition: background-color 0.15s ease, color 0.15s ease !important;
}

.max-btn:active {
  transform: translateY(-50%) !important;
  /* Prevent any movement on click */
  box-shadow: none !important;
}

/* Override DaisyUI button behaviors that might cause movement */
.max-btn:hover,
.max-btn:focus {
  transform: translateY(-50%) !important;
}

/* Animated border for approving state */
.approving-btn {
  position: relative;
  border: none !important;
  z-index: 1;
  overflow: hidden;
}

.approving-btn::before {
  content: "";
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  z-index: -1;
  background: linear-gradient(90deg, 
    rgba(128, 90, 213, 0.8), 
    rgba(168, 85, 247, 0.8), 
    rgba(192, 132, 252, 0.8), 
    rgba(168, 85, 247, 0.8),
    rgba(128, 90, 213, 0.8));
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

/* Add animation for floating circles */
.floating-circle {
  transition: transform 0.3s ease;
}

/* Only animate active circles with class */
.animate-circle {
  animation: float-animation var(--duration) ease-in-out infinite alternate;
  animation-delay: var(--delay);
}

@keyframes float-animation {
  0% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(var(--move-x1), var(--move-y1));
  }
  66% {
    transform: translate(var(--move-x2), var(--move-y2));
  }
  100% {
    transform: translate(0, 0);
  }
}
</style> 