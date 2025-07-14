import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, bsc, mainnet } from "wagmi/chains";
import { type Chain } from 'viem';
import { createConfig, http } from 'wagmi';

const hyperliquidTestnet = {
  id: 998,
  name: 'Hyperliquid Testnet',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid-testnet.xyz/evm'],
    },
    public: {
      http: ['https://rpc.hyperliquid-testnet.xyz/evm'],
    },
  },
  testnet: true,
} as const satisfies Chain;

const hyperliquidMainnet = {
  id: 999,
  name: 'Hyperliquid Mainnet',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.purroofgroup.com"],
    },
    public: {
      http: ["https://rpc.purroofgroup.com"],
    },
  },
  testnet: false,
} as const satisfies Chain;


export const wagmiConfig = getDefaultConfig({
  appName: "Balance Proof",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet, hyperliquidMainnet, hyperliquidTestnet, bsc, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
    [hyperliquidMainnet.id]: http(),
    [hyperliquidTestnet.id]: http(),
  },
  ssr: true,
});