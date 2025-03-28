import { MetaMaskSDK } from '@metamask/sdk';

// Import chain definitions from existing configuration
import { 
  NETWORKS, 
  NETWORK_CATEGORIES 
} from './web3';

// Initialize MetaMask SDK with proper configuration for SDK-only usage
const MMSDK = new MetaMaskSDK({
  // App metadata
  dappMetadata: {
    name: 'AlwaysDogDAPP',
    url: window.location.href,
  },
  // Core SDK settings - optimized for network switching
  useDeeplink: true,
  openDeeplink: true, // Force opening deeplinks
  communicationServerUrl: 'https://metamask-sdk-socket.metafi.codefi.network',
  autoConnect: false, // Changed to false to allow explicit connection
  checkInstallationImmediately: false,
  i18nOptions: {
    enabled: true,
  },
  logging: {
    developerMode: true, // Enable logging for debugging
  },
  // Enable reconnection
  reconnect: {
    enabled: true,
    attemptTimeout: 3000,
    maxAttempts: 5
  },
  // SDK provider settings
  forceInjectProvider: true, 
  injectProvider: true,
  // Remove private _source parameter which might interfere with proper functioning
});

// Create a promise to track connection state
let connectionPromise = null;

// Connect function that returns a promise and caches it
const connectSDK = async (force = false, noConnect = false) => {
  if (noConnect) {
    console.log('Skipping SDK connect due to noConnect flag');
    // Just return a resolved promise without connecting
    return Promise.resolve();
  }

  if (!connectionPromise || force) {
    console.log(`Connecting SDK with force=${force}`);
    connectionPromise = MMSDK.connect({ force });
  } else {
    console.log('Using existing SDK connection');
  }
  return connectionPromise;
};

// Enhanced function to get provider from MetaMask SDK
const getProvider = async (checkOnly = false) => {
  try {
    console.log('Getting provider from MetaMask SDK...');
    
    if (!checkOnly) {
      // Only ensure SDK is connected if not in checkOnly mode
      await connectSDK(false, false);
    } else {
      // Skip connection entirely when in checkOnly mode
      await connectSDK(false, true);
    }
    
    // Get provider after connection is established
    const provider = MMSDK.getProvider();
    
    if (provider) {
      console.log('SDK provider obtained successfully');
      return provider;
    } else {
      console.error('Failed to get provider from SDK');
      
      if (!checkOnly) {
        // Try one more time with forceful connection, but only if not in checkOnly mode
        console.log('Attempting forceful SDK connection...');
        await connectSDK(true, false);
        
        // Try getting provider again
        const retryProvider = MMSDK.getProvider();
        if (retryProvider) {
          console.log('Provider obtained after forceful connection');
          return retryProvider;
        }
      }
      
      console.error('Failed to get provider' + (checkOnly ? ' in check-only mode' : ' even after forceful connection'));
      return null;
    }
  } catch (error) {
    console.error('Error getting MetaMask provider:', error);
    return null;
  }
};

// Export SDK instance, provider getter, and networks
export { 
  MMSDK,
  getProvider,
  connectSDK,
  NETWORKS,
  NETWORK_CATEGORIES
}; 