"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useSignMessage } from "@/hooks/signMessage";
import { serverAction } from "@/actions/server-action";
import { UltraHonkBackend } from "@aztec/bb.js";
import circuit from "../target/circuit.json";
import { Buffer } from 'buffer';

// Make Buffer available globally for the aztec library
// Process is automatically provided by webpack ProvidePlugin
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export default function Connect() {
  const { address, isConnected } = useAccount();
  const { signAndVerify, isVerified, reset } = useSignMessage();

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <ConnectButton />
      {isConnected && <div className="text-xs">{address}</div>}

      {isConnected && (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={signAndVerify}
            disabled={isVerified}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isVerified ? "Message Signed ✓" : "Sign Message"}
          </button>


          {isVerified && (
            <button
              onClick={reset}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          )}


          <button
            onClick={() => serverAction()}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Server
          </button>

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
