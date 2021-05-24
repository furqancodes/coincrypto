const axios = require('axios')

const Blockchain = require('../blockchain/Blockchain')
const TransactionPool = require('../transaction/TransactionPool')
const Wallet = require('../Wallet')
const Pubsub = require('../Pubsub')
const Miner = require('./Miner')

const blockchain = new Blockchain()
const transactionPool = new TransactionPool()
const wallet = new Wallet()
const pubsub = new Pubsub()

const getChain = () => {
  const {body} = axios.get(config.url)
  return body
}

const init = () => {
  blockchain.chain = getChain()
  return new Miner({blockchain, transactionPool, wallet, pubsub})
}

module.exports = {
  init,
}
