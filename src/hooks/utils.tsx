import RLP from "rlp";
import { ethers, type BytesLike } from "ethers";
import { innner_layer_vk } from "./target/verification_keys";



export function hexToBytes(hex: string) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}



// export function uint8ArrayToBigInt(uint8Array) {
//     let result = 0n;
//     for (let i = 0; i < 32; i++) {
//         result = (result << 8n) | BigInt(uint8Array[i]);
//     }
//     return result.toString();
// }
export function uint8ArrayToStringArray(uint8Array: Uint8Array) {
    return Array.from(uint8Array).map((s) => s.toString())
}

export function hexStringToStringUint8Array(hexString: string) {
  const str = Uint8Array.from(Buffer.from(hexString, 'hex'));
  return uint8ArrayToStringArray(str)
}
export function zero_proof() {
  const zero = "0x0000000000000000000000000000000000000000000000000000000000000000"
  const result = []
  for (let index = 0; index < 456; index++) {
    result.push(zero);
  }
  return result
}

export function zero_public_input() {
  const zero = "0x0000000000000000000000000000000000000000000000000000000000000000"
  const result = []
  for (let index = 0; index < 1; index++) {
    result.push(zero);
  }
  return result
}


function hexToBytesPad(raw: string, length: number) {
  const bytes = hexToBytes(raw.substring(2)).map(e => e+"")
  const _length = bytes.length
  for (let index = 0; index < length; index++)
      if (index >= _length)
          bytes.push("0")
  return [bytes, _length]
}

function hexToBytesPadInverse(raw: string, length: number) {
  let bytes = hexToBytes(raw.substring(2)).map(e => e+"")
  const _length = bytes.length
  for (let index = 0; index < length - _length; index++)
    if (index >= _length)
      bytes = ["0"].concat(bytes)
  return bytes
}

export function getNodesFromProof(proof: BytesLike[]) {
  const nodes_initial = []
  const nodes_inner = []
  const nodes_initial_length = 3
  const roots: string[][] = []
  console.log("proof:")
  console.log(proof)
  for (let index = 0; index < proof.length; index++) {
    const nodeRaw = proof[index];
    roots.push(hexToBytesPadInverse(ethers.keccak256(nodeRaw!), 32))

    const decoded = RLP.decode(nodeRaw)
    let node_type: string
    const rows: string[][] = []
    const row_exist: string[] = []
    if (decoded.length == 17) {
      // branch
      node_type = "0"
      let row_count = 0
      decoded.forEach(row => {
        if (row instanceof Uint8Array) {
          if (row_count != 16) {
            let row_: string[] = []
            if (row.length == 32) {
                row.forEach(elem => {row_.push(elem + "")})
                row_exist.push("1")
            } else {
                /* eslint-disable @typescript-eslint/no-unsafe-assignment */
                row_ = Array(32).fill("0")
                row_exist.push("0")
            }
            rows.push(row_)
          }
          row_count += 1
        }
      })
    } else if (decoded.length == 2 && index != proof.length - 1) {
      alert("proof has a extension node!")
      node_type = "2"
    } else {
      console.log("leaf is here:")
      console.log(nodeRaw)
      node_type = "1"
    }

    const node_ = {
        "rows": rows,
        "row_exist": row_exist,
        "node_type": node_type
    }

    if (index < nodes_initial_length)
      nodes_initial.push(node_)
    else if (node_type == "0")
      nodes_inner.push(node_)
  }
  console.log("injaaaaaaa")
  console.log("nodes initial")
  console.log(nodes_initial)
  console.log("nodes_inner")
  console.log(nodes_inner)
  console.log("roots")
  console.log(roots)
  return {nodes_initial, nodes_inner, roots}
}


/* eslint-disable @typescript-eslint/no-explicit-any */
export function encodeAccount(accountRaw: any, address: string) {

  /* eslint-disable @typescript-eslint/no-unsafe-argument */
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  const balance_raw = hexToBytesPad(accountRaw.balance, 32)
  const nonce_raw = hexToBytesPad(accountRaw.nonce, 8)

  console.log("address")
  console.log(address)
  const trie_key = hexToBytesPadInverse(ethers.keccak256(address), 32)
  console.log("trie key:")
  console.log(trie_key)
  const account = {
    balance: balance_raw[0],
    balance_length: balance_raw[1]?.toString(),
    nonce: nonce_raw[0],
    nonce_length: nonce_raw[1]?.toString(),
    address: hexToBytesPadInverse(address, 20)
  }
  return {"account": account, "trie_key": trie_key}
}

export function getInitialPublicInputs(trie_key: string[], _root: string[]) {
  const trie_key_start_index = "0x0000000000000000000000000000000000000000000000000000000000000000"
  const padded_trie_key: string[] = []
  trie_key.forEach(e => {
    padded_trie_key.push("0x" + (+e).toString(16).padStart(64, '0'))
  })
  const root: string[] = []
  _root.forEach(e => {
    root.push("0x" + (+e).toString(16).padStart(64, '0'))
  })
  const initial_inputs = []
  root.forEach(e => {initial_inputs.push(e)})
  padded_trie_key.forEach(e => {initial_inputs.push(e)})
  initial_inputs.push(trie_key_start_index)
  root.forEach(e => {initial_inputs.push(e)})
  for (let index = 0; index < 112; index++) {
    initial_inputs.push("0x0000000000000000000000000000000000000000000000000000000000000000");
  }
  console.log(initial_inputs)
  return initial_inputs
}

export function getInitialPlaceHolderInput() {
  return innner_layer_vk
}