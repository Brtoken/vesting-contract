# BRToken TEST Vesting Contract

## Requrements
- truffle v5.1.43 (Solidity v0.5.16 (solc-js), Node v14.8.0, Web3.js v1.2.1)
- ganache test rpc.

## Getting started
```
$ npm install 
```

## Deploy Vesting contract token
Create `.env` file from `.env.example` file.
Set ```seed``` ```api key``` in `.env` file.

## Deploying contracts to BEP-2 token (for bsc_testnet)
```
$ truffle deploy --reset --network bsc_testnet

```

## Test
```
$ truffle test
```
