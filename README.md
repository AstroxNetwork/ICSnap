# ICSnap

## How it works

1. Use Metamask Flask to hold a Snap Wallet with IC defined identity(Secp256k1). --- IC identity with metamask
2. Use that identity to sign message and act as a device added to II/AstroX ME. --- Use II/AstroX login paradigm
3. Use II/AstroX ME to login to wallet as controller, can send ICP use ledger canister. --- Canister hold/transfer ICP
4. This wallet canister is also an ECDSA threshold wallet, hold a ECDSA publickey --- Canister hold ECDSA publickey
5. Use frontend to construct an ETH transaction, and use ECDSA threshold to sign and broadcast to ETH network --- ICP as multicoin wallet

## Components and install instructions

1. Metamask Flask
   uninstall old metamask, and install 👇
   Metamask Flask: [download](https://metamask.io/flask/)

## Build

```bash
yarn install && yarn build:all && yarn demo:local
```
