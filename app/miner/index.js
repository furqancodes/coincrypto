require('dotenv').config()
const axios = require('axios').default

const Blockchain = require('../blockchain/Blockchain')
const TransactionPool = require('../transaction/TransactionPool')
const Transaction = require('../transaction/Transaction')
const Wallet = require('../Wallet')
const PubSub = require('../pubsub')
const {URL, CHANNELS, BANK_WALLET, MINER_WALLET, MINING_REWARD} = require('../../config')

const blockchain = new Blockchain()
const transactionPool = new TransactionPool()
const recipient = MINER_WALLET.publicKey

const processBlock = (block) => {
  const hash = blockchain.lastBlockHash()
  if (block.lastHash === hash) {
    blockchain.chain.push(block)
    console.info(`block added ${block.hash}`)
  } else if (block.hash === hash) {
    console.info(`already have the block ${block.hash}`)
  }
}

const processTransaction = ({id, outputMap, input}) => {
  const transaction = new Transaction({id, outputMap, input})
  transactionPool.setTransaction(transaction)
}

const processMessage = ({channel, message}) => {
  if (channel === 'confirmed-blocks') processBlock(message)
  else if (channel === 'transactions') processTransaction(message)
}

const pubsub = new PubSub({method: processMessage, channels: CHANNELS.MINER})

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const getChain = async () => {
  const {data} = await axios.get(`${URL}/blockchain`)
  return data
}

const init = async () => {
  await sleep(7000)
  blockchain.chain = await getChain()

  setInterval(() => {
    mineTransaction()
  }, 10000)
}

const mineTransaction = () => {
  const validTransactions = transactionPool.validTransactions()
  if (validTransactions.length > 0) {
    const wallet = new Wallet(BANK_WALLET.privateKey)
    const transaction = new Transaction({
      senderWallet: wallet,
      recipient,
      amount: MINING_REWARD,
    })

    validTransactions.push(transaction)
    const block = blockchain.addBlock({data: validTransactions})
    pubsub.publish({channel: 'unconfirmed-blocks', message: block})
    transactionPool.clear()
  }
  console.info('transaction pool empty')
}

process.on('unhandledRejection', async (error) => {
  console.error(`unhandledRejection ${error}`)
  throw error
})

init()
