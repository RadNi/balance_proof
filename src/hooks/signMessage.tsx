import { useCallback, useState } from 'react';
import { verifyMessage } from 'viem';
import { useAccount } from 'wagmi';
import { signMessage } from 'wagmi/actions';
import { wagmiConfig } from '@/config/wagmi';

const SIGN_MESSAGE = 'Sign this message to verify your wallet';

export const useSignMessage = () => {
    const { address } = useAccount();
    const [isVerified, setIsVerified] = useState(false);

    const reset = useCallback(() => {
        setIsVerified(false);
    }, []);

    const signAndVerify = useCallback(async () => {
        setIsVerified(false);

        try {
            if (!address) {
                return;
            }

            // If no valid stored signature, request a new one
            const signature = await signMessage(wagmiConfig, {
                account: address,
                message: SIGN_MESSAGE,
            });

            const valid = await verifyMessage({
                address,
                message: SIGN_MESSAGE,
                signature,
            });

            if (valid) {
                setIsVerified(true);
            }
        } catch (e: unknown) {
            console.log('Error signing message:', e);
        }
    }, [address]);


    return {
        signAndVerify,
        isVerified,
        reset
    };
};
