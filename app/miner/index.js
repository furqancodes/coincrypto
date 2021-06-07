const axios = require('axios')
const express = require('express')

const Blockchain = require('../blockchain/Blockchain')
const TransactionPool = require('../transaction/TransactionPool')
const Wallet = require('../Wallet')
const Pubsub = require('../Pubsub')
const Miner = require('./Miner')
const {url, DEFAULT_PORT} = require('../../config')

const blockchain = new Blockchain()
const transactionPool = new TransactionPool()
const wallet = new Wallet()
const pubsub = new Pubsub()

const app = express()
app.use(express.json())

const getChain = () => {
  const {body} = axios.get(url)
  return body
}

const init = () => {
  blockchain.chain = getChain()
  return new Miner({blockchain, transactionPool, wallet, pubsub})
}

app.listen(DEFAULT_PORT, () => {
  console.log(`listening on ${config.DEFAULT_PORT}`)
  init()
})
