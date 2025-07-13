# Ethereum Balance Prover

Prove ETH Balance via Zero-Knowledge proofs in Noir.
This project uses [mpt-noirjs](https://github.com/RadNi/mpt-noirjs/tree/main) to read data from RPC and creates zero-knowledge mpt proofs via UltraHonk proof system for [mpt-noir](https://github.com/RadNi/mpt-noir) circuits.
In order to prevent hitting browser memory limit when generating proof, we use dynamic proof recursion. Every layer of the MPT path is proved in one recursion layer other than the first step where no recursion verifier is used but instead multiple layers are proved at once as an optimization!
Finally, a balance_proof circuit is used that verifies the provided signature and account's minimum balance.

## Local
`npm install; npm run build; npm start`
