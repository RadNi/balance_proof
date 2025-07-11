import RLP from "rlp";
import { ethers, type BytesLike } from "ethers";
import { innner_layer_vk } from "./target/verification_keys";



export function hexToBytes(hex: string) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

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
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let account: any = {}
  const nodes_initial_length = 3
  const roots: string[][] = []
  console.log("proof:")
  console.log(proof)
  for (let index = 0; index < proof.length; index++) {
    const nodeRaw = proof[index];
    roots.push(hexToBytesPadInverse(ethers.keccak256(nodeRaw!), 32))

    const decoded = RLP.decode(nodeRaw)
    let node_type: number
    const rows: number[][] = []
    const row_exist: number[] = []
    let prefix_addition: number
    if (decoded.length == 17) {
      // branch
      node_type = 0
      prefix_addition = 1
      let row_count = 0
      console.log("injaaaa")
      console.log(decoded)
      decoded.forEach(row => {
        if (row instanceof Uint8Array) {
          if (row_count != 16) {
            let row_: number[] = []
            if (row.length == 32) {
                row_ = Array.from(row)
                row_exist.push(1)
            } else {
                /* eslint-disable @typescript-eslint/no-unsafe-assignment */
                row_ = Array(32).fill(0)
                row_exist.push(0)
            }
            rows.push(row_)
          }
          row_count += 1
        }
      })
    } else if (decoded.length == 2 && index != proof.length - 1) {
      console.log("proof has a extension node!")
      node_type = 1
      if (decoded[0] instanceof Uint8Array && decoded[1] instanceof Uint8Array) {
        const first_row: number[] = Array(32).fill(0)
        /* eslint-disable @typescript-eslint/non-nullable-type-assertion-style*/
        first_row[0] = ((decoded[0][0] as number) >> 4) & 0xF
        first_row[1] = (decoded[0][0] as number) & 0xF
        first_row[2] = decoded[0].length - 1
        rows.push(first_row)

        const second_row: number[] = Array(32).fill(0)
        for (let index = 0; index < first_row[2]; index++) {
          second_row[index] = decoded[0][index + 1] as number;
        }
        rows.push(second_row)

        let third_row: number[] = []
        decoded[1].map(e => third_row.push(e))
        while (third_row.length != 32) {
          third_row = [0].concat(third_row)
        }
        rows.push(third_row)

        const zero: number[] = Array(32).fill(0)
        for (let index = 0; index < 13; index++)
          rows.push(zero)

        for (let index = 0; index < 16; index++)
          row_exist.push(0)

        prefix_addition = first_row[2] * 2 + first_row[0]
      } else {
        throw Error("extension node has wrong format!")
      }
    } else {
      console.log("leaf is here:")
      console.log(nodeRaw)
      node_type = 2
      account = RLP.decode(RLP.decode(nodeRaw)[1])
      prefix_addition = 0
    }

    const node_ = {
        "rows": rows,
        "row_exist": row_exist,
        "node_type": node_type,
        "prefix_addition": prefix_addition
    }

    if (node_type != 2) {
      if (index < nodes_initial_length)
        nodes_initial.push(node_)
      else
        nodes_inner.push(node_)
    }
  }
  console.log("nodes initial")
  console.log(nodes_initial)
  console.log("nodes_inner")
  console.log(nodes_inner)
  console.log("roots")
  console.log(roots)
  return {nodes_initial, nodes_inner, roots, account}
}


/* eslint-disable @typescript-eslint/no-unsafe-return*/
/* eslint-disable @typescript-eslint/no-explicit-any */
function padArray(data: Array<any>, length: number) {
  for (let index = data.length; index < length; index++) {
    data.push(0)
  }
  return data
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function encodeAccount(accountRaw:  Uint8Array[], address: any) {
  console.log("before")
  console.log(accountRaw)
  console.log(accountRaw[0])
  const account = {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    nonce: padArray(Array.from(accountRaw[0]!), 8),
    balance: padArray(Array.from(accountRaw[1]!), 32),
    nonce_length: accountRaw[0]!.length,
    balance_length: accountRaw[1]!.length,
    address: hexToBytesPadInverse(address, 20)
  }
  const trie_key = hexToBytesPadInverse(ethers.keccak256(address), 32)
  console.log("trie key:")
  console.log(trie_key)
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

export function bigintToUint8Array(value: bigint): number[] {
    let hex = value.toString(16);
    if (hex.length % 2 == 1)
      hex = "0" + hex
    const len = Math.ceil(hex.length / 2);
    const u8: number[] = new Array(len);
    for (let i = 0; i < len; i++) {
        u8[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return u8;
}


export function buf2Bigint(buffer: ArrayBuffer) { // buffer is an ArrayBuffer
  return ethers.formatUnits("0x" + ([...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')))
}