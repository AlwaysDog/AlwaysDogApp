import { ref } from 'vue'
import { supportedTokens as contracts } from '../../config/contracts'
import swapperABI from '../../config/swapperABI.json'
import { swapperUtils } from '../swapperUtils'
import { knownTokens } from '../../config/knownTokens'
import Decimal from 'decimal.js'

export function useTransactions(web3, address, isConnected) {
  // Purchase/sell state
  const isPurchasing = ref(false)
  const transactionResult = ref({
    hash: '',
    paid: 0,
    received: 0,
    fee: 0,
    tokens: []
  })

  // Execute purchase transaction
  const executePurchase = async (buyAmounts, resetAmounts, loadTokenData) => {
    if (!web3.value || !isConnected.value || !address.value) {
      console.log('Web3 not ready or wallet not connected')
      return null
    }
    
    try {
      isPurchasing.value = true
      
      // Get swap fee from contract
      const contract = new web3.value.eth.Contract(swapperABI, contracts.swapper.address)
      const swapFee = await contract.methods.swapFee().call()
      const swapFeeInBNB = web3.value.utils.fromWei(swapFee, 'ether')
      
      // Buy logic
      const buyRequests = Object.entries(buyAmounts.value)
        .filter(([_, amount]) => amount && amount !== '0')
        .map(([tokenAddress, amount]) => ({
          tokenOut: tokenAddress,
          bnbAmount: amount
        }))
      
      if (buyRequests.length === 0) return null
      
      // Add fee to total amount
      const totalBNB = buyRequests.reduce((sum, req) => {
        return sum.plus(new Decimal(req.bnbAmount))
      }, new Decimal('0'))
      
      const totalWithFee = totalBNB.plus(new Decimal(swapFeeInBNB))
      
      const tx = await swapperUtils.batchBuyTokens(buyRequests, web3.value)
      const receipt = await web3.value.eth.getTransactionReceipt(tx)
      
      // Parse SwapExecuted events
      const swapEvents = receipt.logs
        .filter(log => log.topics[0] === web3.value.utils.sha3('SwapExecuted(address,uint256,uint256)'))
        .map(log => {
          const decoded = web3.value.eth.abi.decodeLog([
            { type: 'address', name: 'token', indexed: false },
            { type: 'uint256', name: 'amountIn', indexed: false },
            { type: 'uint256', name: 'amountOut', indexed: false }
          ], log.data, log.topics)
          
          const token = knownTokens.find(t => t.address.toLowerCase() === decoded.token.toLowerCase())
          return {
            address: decoded.token,
            symbol: token?.symbol || 'Unknown',
            bnbAmount: web3.value.utils.fromWei(decoded.amountIn, 'ether'),
            tokenAmount: new Decimal(decoded.amountOut)
              .div(new Decimal(10).pow(token?.decimals || 18))
              .toString()
          }
        })

      const result = {
        hash: tx,
        paid: totalWithFee.toString(),
        fee: swapFeeInBNB,
        tokens: swapEvents.map(event => ({
          address: event.address,
          symbol: event.symbol,
          amount: event.tokenAmount
        }))
      }

      transactionResult.value = result
      
      // Reset amounts
      resetAmounts()
      await loadTokenData()
      
      return result
    } catch (error) {
      console.error('Purchase failed:', error)
      return null
    } finally {
      isPurchasing.value = false
    }
  }

  // Execute sell transaction
  const executeSell = async (sellAmounts, resetAmounts, loadTokenData) => {
    if (!web3.value || !isConnected.value || !address.value) {
      console.log('Web3 not ready or wallet not connected')
      return null
    }
    
    try {
      isPurchasing.value = true
      
      // Sell logic
      const sellRequests = Object.entries(sellAmounts.value)
        .filter(([_, amount]) => amount && amount !== '0')
        .map(([tokenAddress, amount]) => ({
          tokenIn: tokenAddress,
          amountIn: amount
        }))
      
      if (sellRequests.length === 0) return null
      
      const tx = await swapperUtils.batchSellTokens(sellRequests, web3.value)
      const receipt = await web3.value.eth.getTransactionReceipt(tx)
      
      // Parse SwapExecuted events
      const swapEvents = receipt.logs
        .filter(log => log.topics[0] === web3.value.utils.sha3('SwapExecuted(address,uint256,uint256)'))
        .map(log => {
          const decoded = web3.value.eth.abi.decodeLog([
            { type: 'address', name: 'token', indexed: false },
            { type: 'uint256', name: 'amountIn', indexed: false },
            { type: 'uint256', name: 'amountOut', indexed: false }
          ], log.data, log.topics)
          
          const token = knownTokens.find(t => t.address.toLowerCase() === decoded.token.toLowerCase())
          return {
            address: decoded.token,
            symbol: token?.symbol || 'Unknown',
            tokenAmount: new Decimal(decoded.amountIn)
              .div(new Decimal(10).pow(token?.decimals || 18))
              .toString(),
            bnbAmount: web3.value.utils.fromWei(decoded.amountOut, 'ether')
          }
        })

      const totalReceived = swapEvents.reduce((sum, event) => {
        return sum.plus(new Decimal(event.bnbAmount))
      }, new Decimal('0'))

      const result = {
        hash: tx,
        received: totalReceived.toString(),
        tokens: swapEvents.map(event => ({
          address: event.address,
          symbol: event.symbol,
          amount: event.tokenAmount
        }))
      }

      transactionResult.value = result
      
      // Reset amounts
      resetAmounts()
      await loadTokenData()
      
      return result
    } catch (error) {
      console.error('Sell failed:', error)
      return null
    } finally {
      isPurchasing.value = false
    }
  }

  return {
    isPurchasing,
    transactionResult,
    executePurchase,
    executeSell
  }
} 