import { ref, computed } from 'vue'
import { supportedTokens } from '../../config/supportedToken'

export function useTradeUI(isConnected, isCorrectNetwork, isPurchasing, isBuyMode, hasValidInput) {
  // Track active rows with a Set
  const activeRows = ref(new Set())
  const showSuccessModal = ref(false)
  const copiedTxHash = ref(false)

  // Set focused token
  const setFocusedToken = (address) => {
    activeRows.value.add(address)
  }

  // Handle blur event on input
  const handleBlur = (address, tokenAmounts) => {
    const value = tokenAmounts[address]
    if (value === '' || isNaN(parseFloat(value))) {
      tokenAmounts[address] = '0'
      activeRows.value.delete(address)
    }
  }

  // Button text and disabled state
  const purchaseButtonText = computed(() => {
    if (!isConnected.value) return 'Connect Wallet First'
    if (!isCorrectNetwork.value) return 'Wrong Network'
    if (isPurchasing.value) return isBuyMode.value ? 'Purchasing...' : 'Selling...'
    return isBuyMode.value ? 'Purchase' : 'Sell'
  })

  const isPurchaseDisabled = computed(() => {
    return !isConnected.value || 
           !isCorrectNetwork.value || 
           !hasValidInput.value || 
           isPurchasing.value
  })

  // Token display styling
  const generateRowCircles = () => {
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
    }))
  }

  const tokenCircleStyles = ref(
    supportedTokens.reduce((acc, token) => {
      acc[token.address] = generateRowCircles()
      return acc
    }, {})
  )

  // Copy functions
  const copyTxHash = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash)
      copiedTxHash.value = true
      setTimeout(() => {
        copiedTxHash.value = false
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return {
    activeRows,
    showSuccessModal,
    copiedTxHash,
    setFocusedToken,
    handleBlur,
    purchaseButtonText,
    isPurchaseDisabled,
    tokenCircleStyles,
    copyTxHash
  }
} 