import { useCallback, useState } from 'react';
import { Barretenberg, RawBuffer, UltraHonkBackend, deflattenFields } from "@aztec/bb.js";
import mptBodyCircuit from "./target/inner_mpt_body.json";
import mptBodyInitialCircuit from "./target/initial_mpt_body.json";
import balanceCheckCircuit from "./target/leaf_check.json";
import { Noir, type CompiledCircuit, type InputMap } from '@noir-lang/noir_js';
import { encodeAccount, getInitialPublicInputs, getInitialPlaceHolderInput, getNodesFromProof, uint8ArrayToStringArray, hexStringToStringUint8Array } from "./utils";
import { ethers } from "ethers";
import { innner_layer_vk } from "./target/verification_keys";
import { calculateSigRecovery, ecrecover, fromRPCSig, hashPersonalMessage, pubToAddress, type PrefixedHexString } from "@ethereumjs/util";

const SIGN_MESSAGE = 'Sign this message to verify your wallet';


const show = (content: string) => {
  console.log(content)
};



let encoded
let account: Record<string, unknown>
let trie_key: string[]
let nodes_initial: Record<string, unknown>[]
let nodes_inner: Record<string, unknown>[]
let root: string[] | undefined
let new_roots: string[][]
let hashed_message : string[]
let pub_key_x: string[]
let pub_key_y: string[]
let signature : string[]





async function sign_message(from: string) {
  if (window.ethereum) {
    const msg = "We love cryptography!"
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const signature_: PrefixedHexString = await window.ethereum!.request({
        method: "personal_sign",
        params: [msg, from],
    }) as PrefixedHexString
    const msgBuf = Buffer.from(msg)
    const {r, s, v} = fromRPCSig(signature_)
    const hashed_message_ = hashPersonalMessage(msgBuf)

    const pk = ecrecover(hashed_message_, calculateSigRecovery(v), r, s, 1n)
    console.log("Adreeesss")
    console.log(pubToAddress(pk))
    console.log("Public key")
    console.log(pk)

    pub_key_x = []
    pk.slice(0, 32).forEach(x => {
        pub_key_x.push("" + x)
    });
    pub_key_y= []
    pk.slice(32).forEach(y => {
        pub_key_y.push("" + y)
    });

    signature = hexStringToStringUint8Array(signature_.substring(2, 130))
    hashed_message = uint8ArrayToStringArray(hashed_message_)

    console.log("public key x coordinate 📊: ", pub_key_x);
    console.log("public key y coordinate 📊: ", pub_key_y);
    console.log("hashed_message: ", hashed_message)
    console.log("signature: ", signature)
    }
}




async function you() {
  
    show("Generating inner circuit verification key... ⏳");
    const mptBodyInitialCircuitNoir = new Noir(mptBodyInitialCircuit as CompiledCircuit);
    const mptBodyInitialBackend = new UltraHonkBackend(mptBodyInitialCircuit.bytecode);
    // const mptBodyInitialCircuitVerificationKey = await mptBodyInitialBackend.getVerificationKey();

    const mptBodyCircuitNoir = new Noir(mptBodyCircuit as CompiledCircuit);
    const mptBodyBackend = new UltraHonkBackend(mptBodyCircuit.bytecode, { threads: 5 }, { recursive: true });
    // const mptBodyCircuitVerificationKey = await mptBodyBackend.getVerificationKey();

    const balanceCheckNoir = new Noir(balanceCheckCircuit as CompiledCircuit);
    const balanceCheckBackend = new UltraHonkBackend(balanceCheckCircuit.bytecode, { threads: 5 }, { recursive: true });
    let recursiveProof;
    let input;


    // initial layer
    const initial_nodes_length = nodes_initial.length
    input = {
      nodes: nodes_initial,
      node_length: "" + initial_nodes_length,
      trie_key_new_index: "" + initial_nodes_length,
      root: root,
      trie_key: trie_key,
      new_root: new_roots[initial_nodes_length - 1],
      public_inputs: getInitialPublicInputs(trie_key, root!),
      placeholder: getInitialPlaceHolderInput()
    } as InputMap
    show("Generating initial circuit witness... ⏳ ");
    console.log(input)
    const initial_witness = await mptBodyInitialCircuitNoir.execute(input)
    show("Generating initial proof... ⏳ ");
    const initial_proof = await mptBodyInitialBackend.generateProof(initial_witness.witness);
    show("Verifying initial proof... ⏳");
    const initial_verified = await mptBodyInitialBackend.verifyProof({ proof: initial_proof.proof, publicInputs: initial_proof.publicInputs });
    show("Initial proof verified: " + initial_verified);
    recursiveProof = {proof: deflattenFields(initial_proof.proof), publicInputs: initial_proof.publicInputs}

    show("Generating inner circuit witness... ⏳");
    console.log("new roots inja ", nodes_inner.length)
    
    for (let i = 0; i < nodes_inner.length; i++) {
        console.log(i + initial_nodes_length)
        console.log(new_roots[i + initial_nodes_length])
    }
    
    for (let i = 0; i < nodes_inner.length; i++) {
        input = {
          nodes: [nodes_inner[i]],
          node_length: "1",
          trie_key_new_index: ""+(i + initial_nodes_length + 1),
          root: root,
          trie_key: trie_key,
          new_root: new_roots[i + initial_nodes_length],
          proof: recursiveProof.proof,
          public_inputs: recursiveProof.publicInputs,
          verification_key: innner_layer_vk,
          is_first_inner_layer: "0"
        } as InputMap
        if (i == 0) {
          // second layer
          input.is_first_inner_layer = "1"
          show("Generating recursive circuit witness... ⏳ " + i);
          console.log(input)
          const { witness } = await mptBodyCircuitNoir.execute(input)
          show("Generating recursive proof... ⏳ " + i);
          const {proof, publicInputs} = await mptBodyBackend.generateProof(witness);
          show("Verifying intermediary proof... ⏳");
          const verified = await mptBodyBackend.verifyProof({ proof: proof, publicInputs: publicInputs });
          show("Intermediary proof verified: " + verified);
          recursiveProof = {proof: deflattenFields(proof), publicInputs}
        } else {
          // inner of the layers
          input.is_first_inner_layer = '0'
          show("Generating recursive circuit witness... ⏳ " + i);
          console.log(input)
          const { witness } = await mptBodyCircuitNoir.execute(input)
          show("Generating recursive proof... ⏳ " + i);
          const {proof, publicInputs} = await mptBodyBackend.generateProof(witness);
          show("Verifying intermediary proof... ⏳");
          console.log(proof)
          console.log(publicInputs)
          const verified = await mptBodyBackend.verifyProof({ proof: proof, publicInputs: publicInputs });
          show("Intermediary proof verified: " + verified);
          recursiveProof = {proof: deflattenFields(proof), publicInputs}
        }
    }
    console.log(recursiveProof.proof)
    console.log(recursiveProof.publicInputs)



    const balanceCheckInput = {
        account: account,
        root: root,
        leaf_hash_: new_roots[new_roots.length - 1],
        
        balance_target: ["20", "85", "194", "64", "213", "170", "64", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
        balance_target_length: "7",
        proof: recursiveProof.proof,
        trie_key_index: nodes_initial.length + nodes_inner.length + "",
        verification_key: innner_layer_vk,
        hashed_message: hashed_message,
        // public_key: public_key,
        pub_key_x: pub_key_x,
        pub_key_y: pub_key_y,
        signature: signature,
        public_inputs: recursiveProof.publicInputs
    } as InputMap
    console.log(balanceCheckInput)
    const { witness } = await balanceCheckNoir.execute(balanceCheckInput)
    const finalProof = await balanceCheckBackend.generateProof(witness, {keccakZK: true});


    // Verify recursive proof
    show("Verifying final proof... ⏳");
    const verified = await balanceCheckBackend.verifyProof({ proof: finalProof.proof, publicInputs: finalProof.publicInputs }, {keccakZK: true});
    show("Final proof verified: " + verified);
    show(finalProof.proof.toString())
}


async function me() {
  


    show("Connecting to metamask... ⏳");


    if (window.ethereum) {
      /* eslint-disable @typescript-eslint/no-unsafe-argument */
      const mmProvider = new ethers.BrowserProvider(window.ethereum)
      
      /* eslint-disable @typescript-eslint/no-unsafe-argument */
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      const from = (await mmProvider.send("eth_requestAccounts", []))[0]
      console.log(from)
      await sign_message(from)

      const provider = new ethers.JsonRpcProvider("https://docs-demo.quiknode.pro/")
      const address = from
      const output = await provider.send("eth_getProof", [address, [], "latest"])
      console.log(output)
      encoded = getNodesFromProof(output.accountProof)
      const x = encodeAccount(encoded.account, address)
      account = x.account
      trie_key = x.trie_key
      console.log(encoded.nodes_initial)
      nodes_initial = encoded.nodes_initial
      nodes_inner = encoded.nodes_inner
      root = encoded.roots[0]
      new_roots = encoded.roots.slice(1)
      console.log(nodes_initial)
      console.log(nodes_inner)
      console.log(account)
      console.log(new_roots)
      console.log(root)
        
        // const provider = new ethers.BrowserProvider(window.ethereum)
    
    //  from = await provider.send("eth_requestAccounts", [])  // hardhat wallet 0
    //  console.log(from)
   } else {
        console.log("sag")
    }
}


export const useSignMessage = () => {
    const address = "BLANK";
    const [isVerified, setIsVerified] = useState(false);

    const reset = useCallback(() => {
        setIsVerified(false);
    }, []);

    const signAndVerify = useCallback(async () => {
        await me()
        await you()


















    }, [isVerified, address]);


    return {
        signAndVerify,
        isVerified,
        reset
    };
};

