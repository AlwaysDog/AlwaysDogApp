import { ref, computed } from 'vue'
import { supportedTokens } from '../../config/supportedToken'

export function useTradeState() {
  // Mode state
  const isBuyMode = ref(true)

  // Separate state for buy and sell amounts
  const buyAmounts = ref(
    supportedTokens.reduce((acc, token) => {
      acc[token.address] = '0'
      return acc
    }, {})
  )

  const sellAmounts = ref(
    supportedTokens.reduce((acc, token) => {
      acc[token.address] = '0'
      return acc
    }, {})
  )

  // Use the appropriate amounts based on mode
  const tokenAmounts = computed(() => 
    isBuyMode.value ? buyAmounts.value : sellAmounts.value
  )

  // Input handling
  const handleAmountUpdate = ({ address, value }) => {
    if (isBuyMode.value) {
      buyAmounts.value[address] = value
    } else {
      sellAmounts.value[address] = value
    }
  }

  // Reset amounts
  const resetAmounts = () => {
    Object.keys(buyAmounts.value).forEach(key => {
      buyAmounts.value[key] = '0'
    })
    
    Object.keys(sellAmounts.value).forEach(key => {
      sellAmounts.value[key] = '0'
    })
  }

  return {
    isBuyMode,
    buyAmounts,
    sellAmounts,
    tokenAmounts,
    handleAmountUpdate,
    resetAmounts
  }
}