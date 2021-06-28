require('dotenv').config()
const axios = require('axios').default

const Blockchain = require('../blockchain/Blockchain')
const TransactionPool = require('../transaction/TransactionPool')
const Wallet = require('../Wallet')
const PubSub = require('../pubsub')
const Miner = require('./Miner')
const {URL, CHANNELS, BANK_WALLET, MINER_WALLET} = require('../../config')

let bankWallet, minerWallet
const blockchain = new Blockchain()
const transactionPool = new TransactionPool()


const processTransaction = (transaction) => {
  transactionPool.setTransaction(transaction)
}

const processBlock = (block) => {
  const hash = blockchain.lastBlockHash()
  if (block.lastHash === hash) {
    blockchain.chain.push(block)
    console.info(`block added ${block.hash}`)
  } else if (block.hash === hash) {
    console.info(`already have the block ${block.hash}`)
  }
}

const processMessage = ({channel, message}) => {
  if (channel === 'confirmed-blocks') processBlock(message)
  else if (channel === 'transactions') processTransaction(message)
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const pubsub = new PubSub({method: processMessage, channels: CHANNELS.MINER})

const getChain = async () => {
  const {data} = await axios.get(`${URL}/blockchain`)
  return data
}

const init = async () => {
  await sleep(7000)
  blockchain.chain = await getChain()
  bankWallet = new Wallet(BANK_WALLET.privateKey, blockchain.chain)
  minerWallet = new Wallet(MINER_WALLET.privateKey, blockchain.chain)
  const miner = new Miner({blockchain, transactionPool, bankWallet, minerWallet, pubsub})


  setInterval(() => {
    miner.mineTransaction()
  }, 10000)
}

process.on('unhandledRejection', async (error) => {
  console.error(`unhandledRejection ${error}`)
  throw error
})

init()
