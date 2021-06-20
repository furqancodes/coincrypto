require('dotenv').config()
const config = require('./config')

require('./app/db/mongoose')

// eslint-disable-next-line import/order
const express = require('express')

const Blockchain = require('./app/blockchain/Blockchain')
const Wallet = require('./app/Wallet')
const PubSub = require('./app/pubsub')
const TransactionPool = require('./app/transaction/TransactionPool')
const Users = require('./app/db/models/Users')

const app = express()
const blockchain = new Blockchain()
const bankWallet = new Wallet(config.BANK_WALLET.privateKey)
const transactionPool = new TransactionPool()

const processBlock = ({channel, message}) => {
  blockchain.validateAndAddBlock(message, transactionPool)
}

const pubsub = new PubSub({method: processBlock, channels: config.CHANNELS.APP})

app.use(express.json())

app.post('/wallet', async (req, res) => {
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
})

app.get('/blockchain', (req, res) => {
  res.send(blockchain.chain)
})

app.post('/transfer', async (req, res) => {
  const {amount, recipient, senderPublicKey} = req.body
  console.log(senderPublicKey)
  const {privateKey} = await Users.findOne({
    publicKey: senderPublicKey,
  })
  // console.log(`privateKEY ${privateKey}`)
  const wallet = new Wallet(privateKey)
  // console.log(`wallet`+JSON.stringify(wallet))
  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  })
  // console.log(`transaction`+JSON.stringify(transaction))
  try {
    if (transaction) {
      console.log('--------------------------'+JSON.stringify(transaction))
      transaction.update({senderWallet: wallet, recipient, amount, transactionPool})
    } else {
      transaction = Wallet.createTransaction({
        senderWallet: wallet,
        recipient,
        amount,
        chain: blockchain.chain,
      })
      // console.log(transaction+"popopop")
    }
  } catch (error) {
    return res.status(400).json({type: 'error', message: error.message})
  }
  transactionPool.setTransaction(transaction)
  await pubsub.publish({channel: 'transactions', message: transaction})
  res.json({
    type: 'TRANSACTION PUBLISHED',
    message: transaction,
    balance: wallet.balance,
  })
})

app.get('/wallet/:publicKey', async (req, res) => {
  const address = req.params.publicKey
  // console.log(`address ${address}`)
  const {privateKey} = await Users.findOne({
    publicKey: address,
  })
  const wallet = new Wallet(privateKey)
  res.send({
    address,
    balance: Wallet.calculateBalance({chain: blockchain.chain, address}),
    transactions: Wallet.walletTransactions({
      wallet,
      chain: blockchain.chain,
    }),
  })
})

app.get('/', (req, res) => {
  res.send({getBlockchain: '/blockchain'})
})

app.listen(config.DEFAULT_PORT, () => {
  console.log(`listening on ${config.URL}`)
})
