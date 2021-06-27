require('dotenv').config()

const express = require('express')
const morgan = require('morgan')

// eslint-disable-next-line import/order
const config = require('./config')
require('./app/db/mongoose')

const Blockchain = require('./app/blockchain/Blockchain')
const Wallet = require('./app/Wallet')
const PubSub = require('./app/pubsub')
const TransactionPool = require('./app/transaction/TransactionPool')
const Users = require('./app/db/models/Users')

const app = express()

app.use(morgan('[:date[clf]] :method :url :status :res[content-length] - :response-time ms'))

const blockchain = new Blockchain()
const bankWallet = new Wallet(config.BANK_WALLET.privateKey)
const transactionPool = new TransactionPool()

const processBlock = ({channel, message}) => {
  blockchain.validateAndAddBlock(message, transactionPool)
}

const pubsub = new PubSub({method: processBlock, channels: config.CHANNELS.APP})

app.use(express.json())

app.post('/wallet', async (req, res) => {
  try {
    const wallet = new Wallet()
    const user = new Users({
      publicKey: wallet.publicKey,
      balance: Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey}),
      privateKey: wallet.privateKey,
    })
    const transaction = Wallet.createTransaction({
      senderWallet: bankWallet,
      amount: 1000,
      recipient: wallet.publicKey,
      chain: blockchain.chain,
    })

    transactionPool.setTransaction(transaction)
    await pubsub.publish({channel: 'transactions', message: transaction})
    await user.save()
    res.send({publicKey: wallet.publicKey})
  } catch (e) {
    console.error(`post /wallet ${e} | ${e.stack}`)
    res.status(500).json({type: 'error', message: e.message})
  }
})

app.get('/blockchain', (req, res) => {
  try {
    res.send(blockchain.chain)
  } catch (e) {
    console.error(`get /blockchain ${e} | ${e.stack}`)
    res.status(500).json({type: 'error', message: e.message})
  }
})

app.post('/transfer', async (req, res) => {
  try {
    const {amount, recipient, senderPublicKey} = req.body
    const users = await Users.find({publicKey: [senderPublicKey, recipient]})

    if (!users || users.length < 2)
      return res.status(400).json({type: 'error', message: 'invalid sender or recipient address'})

    const sender = users.find(user => user.publicKey === senderPublicKey)

    const wallet = new Wallet(sender.privateKey, blockchain.chain)
    let transaction = transactionPool.existingTransaction({
      inputAddress: wallet.publicKey,
    })

    if (transaction) {
      transaction.update({senderWallet: wallet, recipient, amount, transactionPool})
    } else {
      transaction = Wallet.createTransaction({
        senderWallet: wallet,
        recipient,
        amount,
        chain: blockchain.chain,
      })
    }

    transactionPool.setTransaction(transaction)
    await pubsub.publish({channel: 'transactions', message: transaction})
    res.json({
      type: 'TRANSACTION PUBLISHED',
      message: transaction,
      balance: wallet.balance,
    })
  } catch (e) {
    console.error(`post /transfer ${e} | ${e.stack}`)
    res.status(500).json({type: 'error', message: e.message})
  }
})

app.get('/wallet/:publicKey', async (req, res) => {
  try {
    const address = req.params.publicKey
    const user = await Users.findOne({publicKey: address})

    if (!user)
      return res.status(400).json({type: 'error', message: 'invalid address'})

    const wallet = new Wallet(user.privateKey)
    res.send({
      address,
      balance: Wallet.calculateBalance({chain: blockchain.chain, address}),
      transactions: Wallet.walletTransactions({
        wallet,
        chain: blockchain.chain,
      }),
    })
  } catch (e) {
    console.error(`get /wallet/:publicKey ${e} | ${e.stack}`)
    res.status(500).json({type: 'error', message: e.message})
  }
})

app.listen(config.DEFAULT_PORT, async () => {
  console.info(`listening on ${config.URL}`)
  await blockchain.loadBlocks()
})
