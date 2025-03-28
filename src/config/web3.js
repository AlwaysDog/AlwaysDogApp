import { 
  mainnet, 
  sepolia, 
  arbitrum, 
  optimism, 
  polygon, 
  bsc, 
  avalanche, 
  fantom, 
  gnosis, 
  goerli, 
  polygonMumbai, 
  bscTestnet, 
  arbitrumGoerli, 
  optimismGoerli, 
  avalancheFuji, 
  fantomTestnet, 
  polygonZkEvm, 
  zkSync
} from '@wagmi/chains'

// Helper function to safely add networks
const safeAddNetwork = (chainObj) => {
  if (chainObj && chainObj.id && chainObj.name) {
    return { [chainObj.id]: chainObj.name }
  }
  return {}
}

// Group networks by category
export const NETWORK_CATEGORIES = {
  Mainnets: {
    ...safeAddNetwork(mainnet),
    ...safeAddNetwork(polygon),
    ...safeAddNetwork(bsc),
    ...safeAddNetwork(arbitrum),
    ...safeAddNetwork(optimism),
    ...safeAddNetwork(avalanche),
    ...safeAddNetwork(fantom),
    ...safeAddNetwork(gnosis),
  },
  Testnets: {
    ...safeAddNetwork(sepolia),
    ...safeAddNetwork(goerli),
    ...safeAddNetwork(polygonMumbai),
    ...safeAddNetwork(bscTestnet),
    ...safeAddNetwork(arbitrumGoerli),
    ...safeAddNetwork(optimismGoerli),
    ...safeAddNetwork(avalancheFuji),
    ...safeAddNetwork(fantomTestnet),
  },
  Layer2: {
    ...safeAddNetwork(arbitrum),
    ...safeAddNetwork(optimism),
    ...safeAddNetwork(polygonZkEvm),
    ...safeAddNetwork(zkSync),
  }
}

// Clean up empty categories
Object.keys(NETWORK_CATEGORIES).forEach(category => {
  if (Object.keys(NETWORK_CATEGORIES[category]).length === 0) {
    delete NETWORK_CATEGORIES[category];
  }
});

// Flat network object for backward compatibility
export const NETWORKS = Object.entries(NETWORK_CATEGORIES).reduce((acc, [_, networks]) => {
  return { ...acc, ...networks }
}, {}) 