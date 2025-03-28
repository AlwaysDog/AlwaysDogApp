import { ref } from 'vue'
import { web3Utils } from '../web3Utils'
import { supportedTokens } from '../../config/supportedToken'
import { supportedTokens as contracts } from '../../config/contracts'
import Decimal from 'decimal.js'

export function useTokenData(web3, address, isConnected) {
  // Track token balances and approvals
  const tokenBalances = ref({})
  const tokenApprovals = ref({})
  const loadingApprovals = ref({})

  // Spender address for approvals
  const SPENDER_ADDRESS = contracts.swapper.address

  // Load token balances and approvals
  const loadTokenData = async () => {
    if (!isConnected.value || !address.value || !web3.value) return

    for (const token of supportedTokens) {
      try {
        // Get balance
        const balance = await web3Utils.getTokenBalance(token.address, address.value, web3.value)
        tokenBalances.value[token.address] = balance

        // Check approval
        const approved = await web3Utils.isTokenApproved(
          token.address,
          address.value,
          SPENDER_ADDRESS,
          web3.value
        )
        tokenApprovals.value[token.address] = approved
      } catch (error) {
        console.error(`Error loading token data for ${token.symbol}:`, error)
      }
    }
  }

  // Handle token approval
  const approveToken = async (tokenAddress) => {
    if (!web3.value || !isConnected.value) return

    loadingApprovals.value[tokenAddress] = true
    try {
      const tx = await web3Utils.approveToken(tokenAddress, SPENDER_ADDRESS, web3.value)
      tokenApprovals.value[tokenAddress] = true
    } catch (error) {
      console.error('Error approving token:', error)
    } finally {
      loadingApprovals.value[tokenAddress] = false
    }
  }

  // Handle max button click - Fix to use full precision with Decimal.js
  const setMaxAmount = (tokenAddress) => {
    if (tokenBalances.value[tokenAddress]) {
      // Use raw balance value and full precision with Decimal.js
      const rawBalance = tokenBalances.value[tokenAddress].raw;
      const decimals = tokenBalances.value[tokenAddress].decimals;
      
      // Use Decimal.js to maintain full precision
      return new Decimal(rawBalance)
        .div(new Decimal(10).pow(decimals))
        .toString(); // This maintains full precision
    }
    return '0';
  }

  return {
    tokenBalances,
    tokenApprovals,
    loadingApprovals,
    loadTokenData,
    approveToken,
    setMaxAmount
  }
} 