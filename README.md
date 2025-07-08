# Test application

Basic setup with NextJS app router, Viem, Wagmi, Rainbowkit. This lets the users connect their wallet and sign a message.

## Installation
`npm install; npm run dev`

no `.env` needed

## Buttons
By default, there is a `Connect Wallet` button which uses Rainbowkit to connect.

Once connected, there are two new buttons:
- `Sign Message` has the user sign a message with their wallet. This happens client side.
- `Server` calls a server action. This happens server side.