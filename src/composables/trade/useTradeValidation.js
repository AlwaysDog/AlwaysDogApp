import { computed } from 'vue'
import Decimal from 'decimal.js'

export function useTradeValidation(tokenAmounts, tokenBalances, isBuyMode) {
  // Validation constants
  const MIN_AMOUNT = 0.002
  const MAX_AMOUNT = 2

  // Validation for buy mode
  const isValidAmount = (amount) => {
    if (!amount || amount === '0' || amount === 0) return true
    const value = parseFloat(amount)
    return !isNaN(value) && value >= MIN_AMOUNT && value <= MAX_AMOUNT
  }

  const getValidationMessage = (amount) => {
    if (!amount || amount === '0' || amount === 0) return `Min: ${MIN_AMOUNT} BNB, Max: ${MAX_AMOUNT} BNB`
    if (!isValidAmount(amount)) {
      const value = parseFloat(amount)
      if (value < MIN_AMOUNT) return `Minimum amount is ${MIN_AMOUNT} BNB`
      if (value > MAX_AMOUNT) return `Maximum amount is ${MAX_AMOUNT} BNB`
    }
    return `Min: ${MIN_AMOUNT} BNB, Max: ${MAX_AMOUNT} BNB`
  }

  // Validation for sell mode
  const isValidSellAmount = (address, amount) => {
    if (!amount || amount === '0') return true
    const value = parseFloat(amount)
    const maxAmount = tokenBalances.value[address]?.formatted || 0
    return !isNaN(value) && value >= 0 && value <= parseFloat(maxAmount)
  }

  const getSellValidationMessage = (address) => {
    const maxAmount = tokenBalances.value[address]?.formatted || 0
    return `Max: ${Number(maxAmount).toFixed(4)} tokens`
  }

  // Check if row has valid input
  const hasValidInput = computed(() => {
    return Object.entries(tokenAmounts.value).some(([address, amount]) => {
      if (!amount || amount === '0') return false
      return isBuyMode.value 
        ? isValidAmount(amount)
        : isValidSellAmount(address, amount)
    })
  })

  return {
    MIN_AMOUNT,
    MAX_AMOUNT,
    isValidAmount,
    getValidationMessage,
    isValidSellAmount,
    getSellValidationMessage,
    hasValidInput
  }
} 