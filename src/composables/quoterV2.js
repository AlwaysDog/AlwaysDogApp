import { ref, computed } from 'vue'
import quoterV2ABI from './quoterV2.abi.json'
import { supportedTokens } from '../config/supportedToken'
import { encodePath } from '../utils/path'
import Decimal from 'decimal.js'

// Add WBNB address directly since it's a constant on BNB Chain
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const QUOTER_V2_ADDRESS = '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997'

export const useQuoterV2 = (web3) => {
  const tokenPrices = ref({})
  const isLoading = ref(false)
  const error = ref(null)

  // Create a computed property for the contract
  const quoterContract = computed(() => {
    if (!web3?.value) return null
    return new web3.value.eth.Contract(quoterV2ABI, QUOTER_V2_ADDRESS)
  })

  const getTokenPrice = async (tokenAddress, decimals) => {
    try {
      if (!web3?.value || !quoterContract.value) {
        throw new Error('Web3 not initialized')
      }

      const token = supportedTokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase())
      if (!token) throw new Error('Token not found in supported list')

      // Calculate amount based on token decimals (1 token)
      const amountOut = new Decimal(10).pow(decimals).toString()

      // Create path for token -> WBNB
      const path = encodePath(
        [tokenAddress, WBNB],
        [token.fee]
      )

      const quote = await quoterContract.value.methods.quoteExactOutput(
        path,
        amountOut
      ).call()

      // Return BNB amount required for 1 token
      return web3.value.utils.fromWei(quote.amountIn, 'ether')
    } catch (err) {
      console.error(`Error getting price for token ${tokenAddress}:`, err)
      throw err
    }
  }

  const fetchAllTokenPrices = async () => {
    if (!web3?.value) {
      console.warn('Web3 not initialized')
      return
    }

    isLoading.value = true
    error.value = null
    try {
      const prices = {}
      for (const token of supportedTokens) {
        try {
          prices[token.address] = await getTokenPrice(token.address, token.decimals)
        } catch (err) {
          console.warn(`Failed to fetch price for ${token.symbol}:`, err)
          prices[token.address] = null
        }
      }
      tokenPrices.value = prices
    } catch (err) {
      error.value = err
      console.error('Error fetching token prices:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    tokenPrices,
    isLoading,
    error,
    getTokenPrice,
    fetchAllTokenPrices
  }
}

// Helper function to format price
export const formatTokenPrice = (price) => {
  if (!price) return 'N/A'
  
  // Convert to number and format based on size
  const numPrice = Number(price)
  
  if (numPrice < 0.00000001) {
    return '< 0.00000001'
  }
  
  return `~${numPrice.toFixed(8)}`
}
