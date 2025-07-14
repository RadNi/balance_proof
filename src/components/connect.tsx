"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useSignMessage } from "@/hooks/signMessage";
import { Buffer } from 'buffer';

// Make Buffer available globally for the aztec library
// Process is automatically provided by webpack ProvidePlugin
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export default function Connect() {
  const { address, isConnected } = useAccount();
  const { signAndVerify, isVerified, reset, setBalanceTarget, generatingProof, proof_progress, progressReport } = useSignMessage();
console.log()

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <ConnectButton />
      {isConnected && <div className="text-xs">{address}</div>}

      {isConnected && (
        <div className="flex flex-col items-center gap-3">


          {!generatingProof && (

          <input
            onChange={(e) => setBalanceTarget(e.target.value)}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          />
          )}

          {!generatingProof && (
          <button
            onClick={signAndVerify}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate Proof
          </button>
          )}

          {generatingProof && (
          <progress value={proof_progress}/>
          )}

          {generatingProof && (
        <span className="text-center" style={{ color: 'grey' }}>
          {progressReport}
        </span>
          )}

          {/* <button
            onClick={() => serverAction()}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Server
          </button> */}

          {/* <button
            onClick={handleUltraHonkBackend}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            UltraHonk Backend
          </button> */}

        </div>
      )}
    </div>
  );
}
