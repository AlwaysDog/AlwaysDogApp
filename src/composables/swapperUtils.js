import { supportedTokens as contracts } from '../config/contracts'
import swapperABI from '../config/swapperABI.json'
import Decimal from 'decimal.js'

Decimal.set({ precision: 30, rounding: Decimal.ROUND_DOWN })

export const swapperUtils = {
  /**
   * Buy tokens with BNB
   * @param {Array<{tokenOut: string, bnbAmount: string}>} requests - Array of buy requests
   * @param {Web3} web3 - Web3 instance
   * @returns {Promise<string>} Transaction hash
   */
  async batchBuyTokens(requests, web3) {
    try {
      if (!web3) throw new Error('Web3 instance is required')
      
      const contract = new web3.eth.Contract(swapperABI, contracts.swapper.address)
      const account = await web3.eth.getCoinbase()
      
      // Get fixed swap fee
      const swapFee = await contract.methods.swapFee().call()
      const swapFeeInEther = new Decimal(swapFee.toString()).div(new Decimal('1e18'))
      
      // Calculate total BNB amount
      const totalBnbAmount = requests.reduce((sum, req) => {
        return sum.plus(new Decimal(req.bnbAmount))
      }, new Decimal('0'))

      // Add fixed fee to total amount
      const totalWithFee = totalBnbAmount.plus(swapFeeInEther)

      // Format requests for contract
      const formattedRequests = requests.map(req => ({
        tokenOut: req.tokenOut,
        bnbAmount: new Decimal(req.bnbAmount)
          .mul(new Decimal('1e18'))
          .toFixed(0)
          .toString()
      }))

      // Execute batch buy transaction with total amount including fixed fee
      const tx = await contract.methods.batchSwapExactBNBForTokens(formattedRequests)
        .send({
          from: account,
          value: totalWithFee
            .mul(new Decimal('1e18'))
            .toFixed(0)
            .toString()
        })

      return tx.transactionHash
    } catch (error) {
      console.error('Error in batchBuyTokens:', error)
      throw error
    }
  },

  /**
   * Sell tokens for BNB
   * @param {Array<{tokenIn: string, amountIn: string}>} requests - Array of sell requests
   * @param {Web3} web3 - Web3 instance
   * @returns {Promise<string>} Transaction hash
   */
  async batchSellTokens(requests, web3) {
    try {
      if (!web3) throw new Error('Web3 instance is required')
      
      const contract = new web3.eth.Contract(swapperABI, contracts.swapper.address)
      const account = await web3.eth.getCoinbase()

      // Format requests for contract
      const formattedRequests = await Promise.all(requests.map(async req => {
        // Get token decimals
        const tokenContract = new web3.eth.Contract([{
          "constant": true,
          "inputs": [],
          "name": "decimals",
          "outputs": [{"name": "", "type": "uint8"}],
          "type": "function"
        }], req.tokenIn)
        const decimals = await tokenContract.methods.decimals().call()
        
        return {
          tokenIn: req.tokenIn,
          amountIn: new Decimal(req.amountIn)
            .mul(new Decimal(10).pow(decimals))
            .toFixed(0)
            .toString()
        }
      }))

      // Execute batch sell transaction
      const tx = await contract.methods.batchSwapExactTokensForBNB(formattedRequests)
        .send({ from: account })

      return tx.transactionHash
    } catch (error) {
      console.error('Error in batchSellTokens:', error)
      throw error
    }
  }
}
