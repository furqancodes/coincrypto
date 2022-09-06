## Blockchain Microservice (Brain of coinchain-app)

- This service is responsible for all tasks/information related to Blockchain.
- It runs two separate Node.js tasks: Main Blockchain Server and Mining Node
  - Creating new Wallet
  - Running validation node
  - Verifying all transaction and new blocks
  - Adding new blocks to the chain
  - etc
- It provides REST API for all necessary tasks.
- It uses MongoDB to store Blockchain data.
- It uses PubNub for cross communication between different nodes.
- It is accessed by [Users Microservice](https://github.com/furqansays/coinusers) through REST API.
