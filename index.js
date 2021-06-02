require("./app/db/mongoose");

const request = require("request");
const express = require("express");

const Blockchain = require("./app/blockchain/Blockchain");
const PubSub = require("./app/Pubsub");
const Wallet = require("./app/Wallet");
const TransactionMiner = require("./app/miner/Miner");
const Users = require("./app/db/models/Users");
const config = require("./config");

const app = express();
const blockchain = new Blockchain();
const bankWallet = new Wallet(config.BANK_WALLET.privateKey);

const ROOT_NODE = config.isDevelopment
  ? `http://localhost:${config.DEFAULT_PORT}`
  : "https://cyrpto.herokuapp.com";

app.use(express.json());

app.post("/wallet", async (req, res) => {
  const wallet = new Wallet();

  const user = new Users({
    publicKey: wallet.publicKey,
    balance: wallet.balance,
    privateKey: wallet.privateKey,
  });

  const transaction = Wallet.createTransaction({
    senderWallet: bankWallet,
    amount: 1000,
    recipient: wallet.publicKey,
    chain: blockchain.chain,
  });
  transactionMiner = new TransactionMiner({
    blockchain,
    transactionPool,
    wallet,
    pubsub,
  });
  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);
  console.log("created");
  await newWalletUser.save();
  res.send(transactionPool);
});

app.get("/blockchain", (req, res) => {
  res.send(blockchain.chain);
});

// app.post('/api/transfer', async (req, res) => {
//   const {amount, recipient, senderpublicKey} = req.body
//   const pubsub = new PubSub({wallet, blockchain, transactionPool})

//   const {publicKey, privateKey, balance} = await WalletUser.findOne({
//     publicKey: senderpublicKey,
//   })
//   const wallet = new Wallet(privateKey)
//   let transaction = transactionPool.existingTransaction({
//     inputAddress: wallet.publicKey,
//   })
//   try {
//     if (transaction) {
//       transaction.update({senderWallet: wallet, recipient, amount})
//     } else {
//       transaction = Wallet.createTransaction({
//         senderWallet,
//         recipient,
//         amount,
//         chain: blockchain.chain,
//       })
//     }
//   } catch (error) {
//     return res.status(400).json({type: 'error', message: error.message})
//   }
//   transactionPool.setTransaction(transaction)
//   pubsub.broadcastTransaction(transaction)
//   res.json({
//     type: 'SUCCESSFUL TRANSACTION',
//     message: transaction,
//     balance: wallet.balance,
//   })
// })

// app.get('/api/walletinfo', (req, res) => {
//   const address = wallet.publicKey
//   res.send({
//     address,
//     balance: Wallet.calculateBalance({chain: blockchain.chain, address}),
//     transactions: Wallet.walletTransactions({
//       wallet,
//       chain: blockchain.chain,
//     }),
//   })
// })

// app.get('/api/login', (req, res) => {
//   walletuser = WalletUser.findOne(req.publicKey)
//   const wallet = new Wallet(
//     walletuser.publicKey,
//     walletuser.privateKey,
//     walletuser.balance
//   )
// })
// =====================================================

app.get("/", (req, res) => {
  res.send({ getBlockchain: "/api/blockchain", mineBlock: "/api/mine" });
});

// app.post('/api/mine', (req, res) => {
//   const {data} = req.body
//   blockchain.addBlock({data})
//   pubsub.broadcastChain()
//   res.redirect('/api/blocks')
// })

// app.get('/api/transaction-pool-map', (req, res) => {
//   res.send(transactionPool.transactionMap)
// })

// app.get('/api/mine-transactions', (req, res) => {
//   transactionMiner.mineTransaction()
//   res.redirect('/api/blockchain')
// })

// app.post(`${ROOT_NODE}/api/BANK/deposit`, (req, res) => {
//   const {amount, recipient} = req.body
//   let transaction = transactionPool.existingTransaction({
//     inputAddress: BANKWALLET.publicKey,
//   })
//   try {
//     if (transaction) {
//       transaction.update({senderWallet: BANKWALLET, recipient, amount})
//     } else {
//       transaction = BANKWALLET.createDepositTransaction({
//         recipient,
//         amount,
//       })
//     }
//   } catch (error) {
//     return res.status(400).json({type: 'error', message: error.message})
//   }
//   transactionPool.setTransaction(transaction)
//   pubsub.broadcastTransaction(transaction)

//   res.json({type: 'SUCCESSFULLY DEPOSITED', message: transaction})
// })

// const syncRoot = () => {
//   request({url: `${ROOT_NODE}/api/blocks`}, (err, res, body) => {
//     if (!err && res.statusCode === 200) {
//       const rootChain = JSON.parse(body)
//       console.log(`root chain is ${rootChain}`)
//       blockchain.replaceChain(rootChain)
//     }
//   })
//   request(
//     {url: `${ROOT_NODE}/api/transaction-pool-map`},
//     (err, res, body) => {
//       if (!err && res.statusCode === 200) {
//         const rootTransactionPoolMap = JSON.parse(body)
//         console.log(
//           `replace transaction pool map on a sync with ${rootTransactionPoolMap}`
//         )
//         transactionPool.setMap(rootTransactionPoolMap)
//       }
//     }
//   )
// }

// let PEER_PORT
// if (process.env.GENERATE_PEER_PORT === 'true') {
//   PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
// }

// const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT
app.listen(config.DEFAULT_PORT, () => {
  console.log(`listening on ${config.DEFAULT_PORT}`);
  // if (PORT !== DEFAULT_PORT) {
  //   syncRoot()
  // }
});
