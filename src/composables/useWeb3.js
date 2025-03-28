import { ref, onMounted } from 'vue'
import Web3 from 'web3'
import { MMSDK, getProvider, connectSDK, NETWORKS, NETWORK_CATEGORIES } from '../config/metamask'

// Move refs outside the function to make them shared across all instances
const address = ref(null)
const isConnected = ref(false)
const chainId = ref(null)
const web3 = ref(null)
const provider = ref(null)
const network = ref(null)

export function useWeb3() {
  const connectWallet = async () => {
    try {
      console.log('Starting wallet connection process using MetaMask SDK...');
      
      // Ensure SDK is connected and force connection
      await connectSDK(true);
      
      // Get provider (without using checkOnly mode, allowing connection trigger)
      const sdkProvider = await getProvider(false);
      
      if (!sdkProvider) {
        console.error('MetaMask SDK provider not available');
        return;
      }
      
      console.log('MetaMask SDK provider acquired:', sdkProvider);
      provider.value = sdkProvider;
      
      // Create Web3 instance
      web3.value = new Web3(provider.value);
      
      // Request accounts
      console.log('Requesting accounts from MetaMask SDK...');
      const accounts = await provider.value.request({ method: 'eth_requestAccounts' });
      console.log('Accounts received:', accounts);
      
      if (accounts && accounts.length > 0) {
        address.value = accounts[0];
        isConnected.value = true;
        
        // Get current chain ID
        const currentChainId = await provider.value.request({ method: 'eth_chainId' });
        chainId.value = parseInt(currentChainId, 16);
        
        // Update network name
        network.value = NETWORKS[chainId.value] || 'Unknown Network';
        
        // Setup event listeners
        setupEventListeners(provider.value);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      alert('Failed to connect to MetaMask. Please ensure MetaMask is installed and try again.');
    }
  };

  const disconnectWallet = async () => {
    try {
      // Clear local state
      provider.value = null;
      web3.value = null;
      address.value = null;
      isConnected.value = false;
      chainId.value = null;
      network.value = null;
      
      console.log('Local wallet state cleared');
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const initWeb3 = async () => {
    try {
      // Ensure SDK is initialized but completely avoid connection attempts
      await connectSDK(false, true);
      
      // Get provider using checkOnly mode to avoid triggering wallet connection
      const sdkProvider = await getProvider(true);
      
      if (sdkProvider) {
        console.log('Provider found during initialization');
        web3.value = new Web3(sdkProvider);
        provider.value = sdkProvider;
        
        try {
          // Check for already connected accounts (doesn't trigger popup)
          const accounts = await sdkProvider.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts && accounts.length > 0) {
            console.log('Found existing connection:', accounts[0]);
            address.value = accounts[0];
            isConnected.value = true;
            
            const currentChainId = await sdkProvider.request({ method: 'eth_chainId' });
            chainId.value = parseInt(currentChainId, 16);
            network.value = NETWORKS[chainId.value] || 'Unknown Network';
            
            // Setup event listeners for existing connection
            setupEventListeners(sdkProvider);
          } else {
            console.log('No existing connection found');
            isConnected.value = false;
          }
        } catch (error) {
          console.error('Error checking accounts:', error);
          isConnected.value = false;
        }
      } else {
        console.log('MetaMask SDK provider not available during initialization');
        isConnected.value = false;
      }
    } catch (error) {
      console.error('Error in initWeb3:', error);
      isConnected.value = false;
    }
  };
  
  // Helper function to setup event listeners
  const setupEventListeners = (providerInstance) => {
    providerInstance.on('accountsChanged', (accounts) => {
      console.log('Accounts changed:', accounts);
      address.value = accounts[0];
      isConnected.value = !!accounts[0];
    });
    
    providerInstance.on('chainChanged', (newChainId) => {
      console.log('Chain changed:', newChainId);
      const networkId = parseInt(newChainId, 16);
      chainId.value = networkId;
      network.value = NETWORKS[networkId] || 'Unknown Network';
    });
    
    providerInstance.on('disconnect', (error) => {
      console.log('Disconnected from wallet', error);
      address.value = null;
      isConnected.value = false;
      chainId.value = null;
      network.value = null;
    });
  };

  // Add network switching functionality
  const switchNetwork = async (chainIdHex) => {
    try {
      console.log('Attempting to switch network to:', chainIdHex);
      
      // Ensure SDK is connected
      await connectSDK();
      
      // Get provider
      let sdkProvider = provider.value;
      if (!sdkProvider) {
        console.log('No cached provider, getting fresh provider...');
        sdkProvider = await getProvider();
      }
      
      if (!sdkProvider) {
        console.error('MetaMask SDK provider not available for network switching');
        return false;
      }
      
      // Log the provider to check what we're using
      console.log('Using provider for network switch:', sdkProvider);
      
      // Ensure wallet is connected
      if (!isConnected.value) {
        console.log('Wallet not connected, attempting to connect first...');
        await connectWallet();
        
        // Get provider again to ensure we're using the connected provider
        sdkProvider = provider.value;
        
        if (!isConnected.value || !sdkProvider) {
          console.error('Failed to connect wallet before switching network');
          return false;
        }
      }

      // Clear cached provider to ensure we use the latest instance
      provider.value = null;
      provider.value = await getProvider();
      sdkProvider = provider.value;

      // Send network switch request synchronously
      console.log('Sending wallet_switchEthereumChain request with chainId:', chainIdHex);
      const result = await sdkProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      
      console.log('Network switch request result:', result);
      return true; // Success
    } catch (error) {
      console.error('Error switching network:', error);
      
      if (error.code === 4902) {
        // Chain not added yet
        console.log('Chain not added to wallet, need to add it first');
        return false;
      }
      
      return false;
    }
  };

  // Add network to MetaMask
  const addNetwork = async (networkConfig) => {
    try {
      console.log('Attempting to add network:', networkConfig.chainName);
      
      // Ensure SDK is connected
      await connectSDK();
      
      // Get provider
      let sdkProvider = provider.value;
      if (!sdkProvider) {
        console.log('No cached provider, getting fresh provider...');
        sdkProvider = await getProvider();
      }
      
      if (!sdkProvider) {
        console.error('MetaMask SDK provider not available for adding network');
        return false;
      }
      
      // Ensure wallet is connected
      if (!isConnected.value) {
        console.log('Wallet not connected, attempting to connect first...');
        await connectWallet();
        
        // Get provider again
        sdkProvider = provider.value;
        
        if (!isConnected.value || !sdkProvider) {
          console.error('Failed to connect wallet before adding network');
          return false;
        }
      }
      
      // Clear cached provider to ensure we use the latest instance
      provider.value = null;
      provider.value = await getProvider();
      sdkProvider = provider.value;
      
      // Send add network request synchronously
      console.log('Sending wallet_addEthereumChain request for network:', networkConfig.chainName);
      const result = await sdkProvider.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });
      
      console.log('Network add request result:', result);
      return true; // Success
    } catch (error) {
      console.error('Error adding network:', error);
      return false;
    }
  };

  // Switch to BNB Chain (convenience method)
  const switchToBSC = async () => {
    console.log('Attempting to switch to BNB Chain...');
    
    // Ensure SDK is connected
    await connectSDK(true); // Force reconnect to ensure fresh state
    
    // Ensure we're connected before trying to switch networks
    if (!isConnected.value) {
      console.log('Wallet not connected, connecting first...');
      await connectWallet();
      
      if (!isConnected.value) {
        console.error('Failed to connect wallet, cannot switch network');
        return false;
      }
    }
    
    const BSC_CHAIN_ID = '0x38'; // BNB Chain in hex (56 in decimal)
    
    // Try to switch first
    console.log('Trying to switch to BNB Chain...');
    const success = await switchNetwork(BSC_CHAIN_ID);
    
    if (!success) {
      console.log('Switch failed, trying to add BNB Chain network...');
      // If switching failed, try to add the network
      return await addNetwork({
        chainId: BSC_CHAIN_ID,
        chainName: 'BNB Chain',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org'],
        blockExplorerUrls: ['https://bscscan.com']
      });
    }
    
    return true;
  };

  return {
    address,
    isConnected,
    chainId,
    connectWallet,
    disconnectWallet,
    web3,
    network,
    switchNetwork,
    addNetwork,
    switchToBSC,
    initWeb3
  };
}

