// Standard ERC20 ABI for the functions we need
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  }
]

export const web3Utils = {
  /**
   * Get token balance for an address
   * @param {string} tokenAddress - The token contract address
   * @param {string} walletAddress - The wallet address to check
   * @param {Web3} web3 - Web3 instance
   * @returns {Promise<{formatted: string, raw: number, decimals: number}>}
   */
  async getTokenBalance(tokenAddress, walletAddress, web3) {
    try {
      const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress)
      const decimals = await contract.methods.decimals().call()
      const balance = await contract.methods.balanceOf(walletAddress).call()
      
      return {
        formatted: (balance / Math.pow(10, decimals)).toString(),
        raw: balance,
        decimals
      }
    } catch (error) {
      console.error('Error getting token balance:', error)
      throw error
    }
  },

  /**
   * Check if token is approved for spender
   * @param {string} tokenAddress - The token contract address
   * @param {string} walletAddress - The wallet address to check
   * @param {string} spenderAddress - The spender contract address
   * @param {Web3} web3 - Web3 instance
   * @returns {Promise<boolean>}
   */
  async isTokenApproved(tokenAddress, walletAddress, spenderAddress, web3) {
    try {
      const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress)
      const allowance = await contract.methods.allowance(walletAddress, spenderAddress).call()
      return allowance > 0
    } catch (error) {
      console.error('Error checking token approval:', error)
      throw error
    }
  },

  /**
   * Approve token for spender
   * @param {string} tokenAddress - The token contract address
   * @param {string} spenderAddress - The spender contract address
   * @param {Web3} web3 - Web3 instance
   * @returns {Promise<ethers.ContractTransaction>}
   */
  async approveToken(tokenAddress, spenderAddress, web3) {
    try {
      const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress)
      const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      return contract.methods.approve(spenderAddress, maxUint256).send({
        from: await web3.eth.getCoinbase()
      })
    } catch (error) {
      console.error('Error approving token:', error)
      throw error
    }
  },

  /**
   * Format token amount with proper decimals
   * @param {string|number} amount - The amount to format
   * @param {number} decimals - Token decimals
   * @param {number} displayDecimals - Number of decimals to display
   * @returns {string}
   */
  formatTokenAmount(amount, decimals, displayDecimals = 4) {
    try {
      const formatted = amount / Math.pow(10, decimals)
      return formatted.toFixed(displayDecimals)
    } catch (error) {
      console.error('Error formatting token amount:', error)
      return '0.0000'
    }
  },

  /**
   * Parse token amount to BigNumber
   * @param {string|number} amount - The amount to parse
   * @param {number} decimals - Token decimals
   * @returns {ethers.BigNumber}
   */
  parseTokenAmount(amount, decimals) {
    try {
      return (Number(amount) * Math.pow(10, decimals)).toString()
    } catch (error) {
      console.error('Error parsing token amount:', error)
      return '0'
    }
  }
}
