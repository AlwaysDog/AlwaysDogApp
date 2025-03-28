<template>
  <n-config-provider>
    <n-message-provider>
      <div class="min-h-screen bg-base-100" data-theme="dark">
        <div class="navbar bg-base-200">
          <div class="container mx-auto px-4">
            <div class="flex-none">
              <div class="flex items-center gap-2">
                <img 
                  :src="ADogLogo" 
                  alt="AlwaysDog" 
                  class="w-8 h-8 rounded-full"
                />
                <span class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  AlwaysDog
                </span>
              </div>
            </div>
            <div class="flex-1"></div>
            <div class="flex-none flex items-center">
              <div class="hidden md:flex items-center gap-4 mr-4">
                <button 
                  @click="scrollToSection('adog-section')" 
                  class="btn btn-ghost btn-sm"
                >
                  About ADOG
                </button>
                <button 
                  @click="scrollToSection('risk-section')" 
                  class="btn btn-ghost btn-sm"
                >
                  Risk
                </button>
              </div>
              
              <div v-if="!isConnected">
                <button @click="connectWallet" class="btn btn-primary">
                  Connect Wallet
                </button>
              </div>
              <div v-else>
                <div class="dropdown dropdown-end">
                  <label tabindex="0" class="btn btn-ghost">
                    {{ shortAddress }}
                  </label>
                  <ul tabindex="0" class="dropdown-content z-[9999] menu p-2 shadow bg-base-200 rounded-box w-64">
                    <li class="menu-title px-4 py-2">
                      <div class="flex flex-col gap-1">
                        <span class="text-xs opacity-50">Network</span>
                        <span class="font-semibold flex items-center gap-2">
                          <img 
                            :src="networkIcon" 
                            :alt="network"
                            class="w-5 h-5"
                            :class="{'text-warning': !isSupportedNetwork}"
                          />
                          <span 
                            :class="{'text-warning': !isSupportedNetwork}"
                          >
                            {{ network }}
                          </span>
                        </span>
                        <button 
                          v-if="!isSupportedNetwork" 
                          class="flex items-center gap-1 text-xs text-warning hover:underline cursor-pointer text-left p-0 bg-transparent border-none mt-1"
                          @click="handleSwitchToBSC"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(48, 96%, 53%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-triangle">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                          Switch to BNB Chain
                        </button>
                      </div>
                    </li>
                    <li class="menu-title px-4 py-2">
                      <div class="flex flex-col gap-1">
                        <span class="text-xs opacity-50">Balance</span>
                        <span class="font-semibold">{{ balance }}</span>
                      </div>
                    </li>
                    <div class="divider my-0"></div>
                    <li><a @click="disconnectWallet" class="text-error">Disconnect</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <main class="container mx-auto p-4">
          <router-view/>
        </main>

        <!-- Network Dialog -->
        <network-dialog 
          v-model:visible="showNetworkDialog" 
          :target-chain-id="targetChainId"
          :required-network="requiredNetwork"
          @network-switched="handleNetworkSwitched"
          @switch-cancelled="handleSwitchCancelled"
        />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { computed, ref, watchEffect, onMounted, watch } from 'vue'
import { useWeb3 } from './composables/useWeb3'
import BnbIcon from '@/assets/bnb.svg'
import ADogLogo from '@/assets/ADOG.png'
import NetworkDialog from './views/NetworkDialog.vue'
import { connectSDK } from './config/metamask'

const { address, isConnected, connectWallet, disconnectWallet, web3, network, chainId, initWeb3, switchToBSC } = useWeb3()
const balance = ref('0.00')

const shortAddress = computed(() => {
  if (!address.value) return ''
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
})

const isSupportedNetwork = computed(() => {
  return chainId.value === 56 // BNB Chain mainnet chainId
})

const networkColor = computed(() => {
  if (!isSupportedNetwork.value) return 'badge-warning'
  return 'badge-primary'
})

const networkIcon = computed(() => {
  if (!chainId.value) return null
  
  // BNB Chain Mainnet
  if (chainId.value === 56) return BnbIcon
  
  // For other networks, return a SVG icon directly as string
  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(48, 96%, 53%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  `)}`
})

// Update balance when address changes
watchEffect(async () => {
  if (web3.value && address.value) {
    try {
      const balanceWei = await web3.value.eth.getBalance(address.value)
      const symbol = chainId.value === 56 ? 'BNB' : 'ETH'
      balance.value = `${parseFloat(web3.value.utils.fromWei(balanceWei, 'ether')).toFixed(4)} ${symbol}`
    } catch (error) {
      console.error('Error fetching balance:', error)
      balance.value = '0.00'
    }
  } else {
    balance.value = '0.00'
  }
})

// Add scroll function
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// Network dialog related state
const showNetworkDialog = ref(false)
const targetChainId = ref('0x38') // BNB Chain
const requiredNetwork = ref('BNB Chain')

// Initialize SDK on App mount
onMounted(async () => {
  console.log('App mounted, initializing MetaMask SDK and checking for existing connections...')
  try {
    // Initialize SDK only, completely avoid any connection attempt
    // connectSDK(false, true) ensures no connection attempt happens
    await connectSDK(false, true)
    
    // Call initWeb3 to check if there's already a connected wallet
    await initWeb3()
    
    // If connected, check network
    if (isConnected.value) {
      checkNetwork()
    }
  } catch (error) {
    console.error('Error initializing MetaMask SDK:', error)
  }
})

// Watch for network changes
watch(() => chainId.value, (newChainId) => {
  console.log('Chain ID changed to:', newChainId)
  checkNetwork()
})

// Watch for connection status changes
watch(() => isConnected.value, (newIsConnected) => {
  console.log('Connection status changed to:', newIsConnected)
  if (newIsConnected) {
    checkNetwork()
  }
})

// Check if current network is correct
const checkNetwork = () => {
  if (!isConnected.value) {
    console.log('Not connected, skipping network check')
    return
  }
  
  const requiredChainId = parseInt(targetChainId.value, 16)
  
  console.log('Checking network: current =', chainId.value, 'required =', requiredChainId)
  
  if (chainId.value !== requiredChainId) {
    console.log('Wrong network detected, showing dialog')
    showNetworkDialog.value = true
  } else {
    console.log('Correct network detected')
    showNetworkDialog.value = false
  }
}

// Handle successful network switch
const handleNetworkSwitched = (newChainId) => {
  console.log('Network switched successfully to:', newChainId)
  showNetworkDialog.value = false
}

// Handle network switch cancellation
const handleSwitchCancelled = () => {
  console.log('Network switch cancelled')
  showNetworkDialog.value = false
}

// Add a new function to handle direct BNB Chain switching
const handleSwitchToBSC = async () => {
  try {
    const success = await switchToBSC();
    if (!success) {
      console.log('Failed to switch to BNB Chain directly, showing network dialog as fallback');
      showNetworkDialog.value = true;
    }
  } catch (error) {
    console.error('Error switching to BNB Chain:', error);
  }
}
</script>

<style>
html, body {
  background-color: #13151C;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  background-color: hsl(var(--b1));
}

/* Update this to properly handle overscroll areas */
html {
  background-color: hsl(var(--b1));
  height: 100%;
}

body {
  background-color: hsl(var(--b1));
  min-height: 100%;
  margin: 0;
  padding: 0;
}
</style>

<style scoped>
/* Add smooth transition for logo hover */
.btn-ghost:hover img {
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;
}

.btn-ghost img {
  transition: transform 0.2s ease-in-out;
}

/* Add styles for navigation buttons */
.btn-ghost {
  position: relative;
  overflow: hidden;
}

.btn-ghost::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: theme('colors.primary');
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.btn-ghost:hover::after {
  width: 100%;
}
</style>