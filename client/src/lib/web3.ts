import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { type Achievement } from '@/lib/portfolio';

// Simple NFT contract ABI (only mint function)
const NFT_ABI = [
  "function mint(string memory tokenURI) public returns (uint256)",
  "function verifyProof(uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c, uint256[4] memory input) public returns (bool)"
];

// Sepolia testnet contract address
const NFT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // This would be your deployed contract address on Sepolia

export async function connectWallet() {
  try {
    const provider = await detectEthereumProvider();

    if (!provider) {
      throw new Error("Please install MetaMask!");
    }

    // Request account access and switch to Sepolia
    await provider.request({ 
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
    });

    await provider.request({ method: 'eth_requestAccounts' });

    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();

    return { signer, address };
  } catch (error) {
    if (error.code === 4902) {
      // Chain not added, add Sepolia
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia',
            nativeCurrency: {
              name: 'Sepolia ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
      } catch (addError) {
        throw addError;
      }
    }
    console.error("Error connecting wallet:", error);
    throw error;
  }
}

// Function to generate a simple ZK proof of achievement
// In a real implementation, this would use actual ZK-SNARK circuits
function generateAchievementProof(achievementData: Achievement) {
  if (!achievementData || !achievementData.criteria || typeof achievementData.criteria.threshold !== 'number') {
    throw new Error("Invalid achievement data: missing required properties");
  }

  // This is a simplified mock of ZK proof generation
  // In production, this would use a proper ZK proof system like Circom/SnarkJS
  const proofInputs = {
    id: achievementData.id,
    timestamp: Date.now(),
    threshold: achievementData.criteria.threshold,
    type: achievementData.criteria.type
  };

  // Mock proof structure (in reality, this would be actual ZK proof data)
  // The proof demonstrates that:
  // 1. The user has achieved a specific threshold
  // 2. The achievement was earned at a valid timestamp
  // 3. The achievement type matches the criteria
  // All without revealing the actual values
  return {
    a: [1, 2], // elliptic curve point
    b: [[3, 4], [5, 6]], // pairing points
    c: [7, 8], // elliptic curve point
    input: [
      ethers.toBigInt(proofInputs.threshold) ,
      ethers.toBigInt(proofInputs.timestamp),
      Array.from(proofInputs.type).reduce((acc, val) => acc + val.charCodeAt(0), 0) % (1e9 + 7), // hash of achievement type
      Array.from(proofInputs.id).reduce((acc, val) => acc + val.charCodeAt(0), 0) % (1e9 + 7)
    ]
  };
}

export async function mintNFT(signer: ethers.Signer, achievementMetadata: string) {
  try {
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

    // Parse and validate the achievement data
    let achievement: Achievement;
    try {
      achievement = JSON.parse(achievementMetadata);
      console.log(achievement,"achievement");
      if (!achievement.id || !achievement.criteria || !achievement.criteria.threshold) {
        throw new Error("Invalid achievement data structure");
      }
    } catch (error) {
      throw new Error("Failed to parse achievement metadata: " + error.message);
    }

    // Generate ZK proof for the achievement
    const proof = generateAchievementProof(achievement);
     console.log(proof,"proof")
    // First verify the ZK proof on-chain
    const proofValid = await contract.verifyProof(
      proof.a,
      proof.b,
      proof.c,
      proof.input
    );

    if (!proofValid) {
      throw new Error("Achievement verification failed");
    }

    // If proof is valid, mint the NFT
    // In a real implementation, you would:
    // 1. Upload achievement metadata to IPFS
    // 2. Use the IPFS hash as the tokenURI
    const tx = await contract.mint(achievementMetadata);
    await tx.wait();

    return tx.hash;
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
  }
}
