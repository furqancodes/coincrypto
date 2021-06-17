const axios = require('axios').default

const Blockchain = require('../blockchain/Blockchain')
const TransactionPool = require('../transaction/TransactionPool')
const Wallet = require('../Wallet')
const PubSub = require('../pubsub')
const Miner = require('./Miner')
const {url, MINER, BANK_WALLET} = require('../../config')

const bankWallet = new Wallet(BANK_WALLET.privateKey)

const blockchain = new Blockchain()
const transactionPool = new TransactionPool()
const minerWallet = new Wallet()

const processTransaction = (transaction) => {
  transactionPool.setTransaction(transaction)
}

const processMessage = ({channel, message}) => {
  if (channel === 'confirmed-blocks') blockchain.chain.push(message)
  else if (channel === 'transactions') processTransaction(message)
}

const pubsub = new PubSub({method: processMessage, channels: MINER.CHANNELS})

const getChain = async () => {
  const {data} = await axios.get(url)
  return data
}

const init = async () => {
  try {
    blockchain.chain = await getChain()
    const miner = new Miner({blockchain, transactionPool, bankWallet, minerWallet, pubsub})

    setInterval(() => {
      miner.mineTransaction()
    }, 10000)
  } catch (err) {
    console.log('err', err)
    throw err
  }
}

init()
