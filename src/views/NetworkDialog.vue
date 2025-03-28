<template>
  <div>
    <n-modal
      v-model:show="showDialog"
      preset="dialog"
      title="Network Warning"
      positive-text="Switch Network"
      negative-text="Cancel"
      @positive-click="handleSwitchNetwork"
      @negative-click="handleCancel"
      @close="handleCancel"
      style="--n-color:#1c1c20 !important; --n-title-text-color: #ffffff !important; --n-content-text-color: #ffffff !important; --n-border-color: #3f3f46 !important; --n-title-font-weight: 600 !important; --n-bezier: cubic-bezier(.4, 0, .2, 1) !important;"
      :mask-closable="false"
      class="network-dialog"
      transform-origin="center"
    >
      <div class="space-y-4">
        <div class="bg-base-200 border border-warning/20 p-4 rounded-lg text-warning-content">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium">{{ dialogMessage }}</h3>
            </div>
          </div>
        </div>
        
        <div>
          <p class="text-sm opacity-75">Please switch to one of the following supported networks:</p>
          
          <div class="mt-3 grid grid-cols-1 gap-2 overflow-hidden">
            <div
              v-for="(networkInfo, chainIdHex) in supportedNetworks"
              :key="chainIdHex"
              class="cursor-pointer bg-base-200 p-3 rounded-lg border border-base-300 hover:bg-base-300 transition-colors"
              :class="{ 'border-primary/50': selectedNetwork === chainIdHex }"
              @click="selectNetwork(chainIdHex)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-7 h-7 rounded-full flex items-center justify-center"
                    :class="getNetworkColor(networkInfo.name)"
                  >
                    <n-icon size="18">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8z" />
                        <path fill="currentColor" d="M12 17l5-5h-4V7h-2v5H7l5 5z" />
                      </svg>
                    </n-icon>
                  </div>
                  <div>
                    <div class="font-medium">{{ networkInfo.name }}</div>
                    <div class="text-xs opacity-50">Chain ID: {{ parseInt(chainIdHex, 16) }}</div>
                  </div>
                </div>
                <div 
                  v-if="selectedNetwork === chainIdHex"
                  class="text-primary"
                >
                  <n-icon size="20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </n-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useWeb3 } from '../composables/useWeb3'
import { NETWORKS, NETWORK_CATEGORIES } from '../config/metamask'

export default {
  name: 'NetworkDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    targetChainId: {
      type: [String, Number],
      default: null
    },
    requiredNetwork: {
      type: String,
      default: 'BNB Chain'
    }
  },
  emits: ['update:visible', 'network-switched', 'switch-cancelled'],
  setup(props, { emit }) {
    const { chainId, switchNetwork, addNetwork } = useWeb3()
    
    const showDialog = ref(false)
    const selectedNetwork = ref(null)
    const isSwitching = ref(false)
    
    // Supported network list
    const supportedNetworks = {
      '0x38': { 
        name: 'BNB Chain', 
        config: {
          chainId: '0x38',
          chainName: 'BNB Chain',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
          },
          rpcUrls: ['https://bsc-dataseed.binance.org'],
          blockExplorerUrls: ['https://bscscan.com']
        }
      }
    }
    
    const dialogMessage = computed(() => {
      if (chainId.value && NETWORKS[chainId.value]) {
        return `You are currently connected to ${NETWORKS[chainId.value]}, but this application requires ${props.requiredNetwork}. Please switch your network to continue.`
      } else {
        return `This application requires ${props.requiredNetwork}. Please switch your network to continue.`
      }
    })
    
    // When the prop changes, update the internal state
    watch(() => props.visible, (newValue) => {
      showDialog.value = newValue
      
      // Pre-select the target chain id if provided
      if (newValue && props.targetChainId) {
        const hexChainId = typeof props.targetChainId === 'number' 
          ? '0x' + props.targetChainId.toString(16)
          : props.targetChainId
        
        if (supportedNetworks[hexChainId]) {
          selectedNetwork.value = hexChainId
        } else {
          // Default to BNB Chain
          selectedNetwork.value = '0x38'
        }
      } else if (newValue) {
        // Default to BNB Chain if dialog is opened without a specific target
        selectedNetwork.value = '0x38'
      }
    }, { immediate: true })
    
    // When internal state changes, emit event to update the prop
    watch(() => showDialog.value, (newValue) => {
      emit('update:visible', newValue)
    })
    
    // Watch current chainId changes
    watch(() => chainId.value, (newChainId) => {
      // If we're on the correct network and dialog is showing, close it
      if (props.targetChainId) {
        const targetId = typeof props.targetChainId === 'number' 
          ? props.targetChainId
          : parseInt(props.targetChainId, 16)
        
        if (newChainId === targetId && showDialog.value) {
          console.log('Now on correct network, closing dialog...')
          showDialog.value = false
          emit('network-switched', newChainId)
        }
      }
    })
    
    const selectNetwork = (chainIdHex) => {
      selectedNetwork.value = chainIdHex
    }
    
    const handleSwitchNetwork = async () => {
      if (!selectedNetwork.value || isSwitching.value) return
      
      try {
        isSwitching.value = true
        console.log('Attempting to switch to network:', selectedNetwork.value);
        
        // Try to switch to the selected network
        const networkInfo = supportedNetworks[selectedNetwork.value]
        if (!networkInfo) {
          console.error('Network info not found for chain ID:', selectedNetwork.value)
          return
        }
        
        // First try simple switch
        console.log('First trying simple network switch...')
        let success = await switchNetwork(selectedNetwork.value)
        
        // If that fails, try to add the network
        if (!success) {
          console.log('Simple switch failed, trying to add network...')
          success = await addNetwork(networkInfo.config)
        }
        
        if (success) {
          console.log('Network switch successful!')
          // Dialog will be closed automatically by the chainId watcher if successful
        } else {
          console.log('Network switch failed')
        }
      } catch (error) {
        console.error('Error during network switch:', error)
      } finally {
        isSwitching.value = false
      }
    }
    
    const handleCancel = () => {
      showDialog.value = false
      emit('switch-cancelled')
    }
    
    // Color utilities for network icons
    const getNetworkColor = (networkName) => {
      switch (networkName) {
        case 'BNB Chain':
          return 'bg-warning/10 text-warning'
        default:
          return 'bg-base-300 text-base-content'
      }
    }
    
    return {
      showDialog,
      selectedNetwork,
      supportedNetworks,
      dialogMessage,
      selectNetwork,
      handleSwitchNetwork,
      handleCancel,
      getNetworkColor,
      parseInt
    }
  }
}
</script>

<style scoped>
/* Target Naive UI dialog with deep selectors to override their styles */
:deep(.n-modal-body-wrapper) {
  background-color: hsl(var(--b1)) !important;
}

:deep(.n-dialog) {
  background-color: hsl(var(--b1)) !important;
  border: 2px solid hsl(var(--p)) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

:deep(.n-dialog-icon-container) {
  background-color: hsl(var(--b1)) !important;
}

:deep(.n-dialog__title) {
  background-color: hsl(var(--b1)) !important;
  color: hsl(var(--bc)) !important;
  font-weight: 600 !important;
  padding: 16px !important;
}

:deep(.n-dialog__content) {
  background-color: hsl(var(--b1)) !important;
  color: hsl(var(--bc)) !important;
  padding: 0 16px 16px !important;
}

:deep(.n-dialog__action) {
  background-color: hsl(var(--b1)) !important;
  padding: 16px !important;
  display: flex !important;
  gap: 8px !important;
  justify-content: flex-end !important;
}

:deep(.n-button--primary-type) {
  background-color: hsl(var(--p)) !important;
  color: hsl(var(--pc)) !important;
}

:deep(.n-button--default-type) {
  background-color: hsl(var(--b3)) !important;
  color: hsl(var(--bc)) !important;
}

:deep(.n-modal-mask) {
  background-color: rgba(0, 0, 0, 0.7) !important;
}

/* For debugging */
.network-dialog {
  --dialog-bg: hsl(var(--b1));
  --dialog-text: hsl(var(--bc));
}
</style> 