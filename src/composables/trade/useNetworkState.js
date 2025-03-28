import { ref, computed, watch } from 'vue'

export function useNetworkState(web3, isConnected) {
  // Network state
  const showNetworkDialog = ref(false)
  const currentChainId = ref(null)

  // Update the isCorrectNetwork computed property
  const isCorrectNetwork = computed(() => {
    if (!isConnected.value) return true // Consider network correct when not connected
    return currentChainId.value === '0x38' // BNB Chain chainId
  })

  // Check current chain ID
  const checkChainId = async () => {
    if (!web3.value || !isConnected.value) return
    
    try {
      const chainId = await web3.value.eth.getChainId()
      currentChainId.value = '0x' + chainId.toString(16)
      
      if (!isCorrectNetwork.value) {
        showNetworkDialog.value = true
      } else {
        showNetworkDialog.value = false
      }
    } catch (error) {
      console.error('Error getting chain ID:', error)
    }
  }

  // Watch for web3 and connection changes
  watch([web3, isConnected], async ([newWeb3, newIsConnected]) => {
    if (newWeb3 && newIsConnected) {
      await checkChainId()
    }
  })

  return {
    showNetworkDialog,
    currentChainId,
    isCorrectNetwork,
    checkChainId
  }
}