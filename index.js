const request = require("request");
const express = require("express");
const Blockchain = require("./blockchain/index");
const PubSub = require("./app/pubsub");
const Transactionpool = require("./wallet/transaction-pool");
const Wallet = require("./wallet");
const BankWallet = require("./wallet/BankWallet");
const TransactionMiner = require("./app/transaction-miner");

const app = express();
const blockchain = new Blockchain();
const transactionPool = new Transactionpool();
const wallet = new Wallet();
const BANKWALLET = new BankWallet();
const pubsub = new PubSub({ wallet, blockchain, transactionPool });
const transactionMiner = new TransactionMiner({
  blockchain,
  transactionPool,
  wallet,
  pubsub,
});

const DEFAULT_PORT = 3000;
const isDevelopment = process.env.ENV === "development";

const ROOT_NODE = isDevelopment
  ? `http://localhost:${DEFAULT_PORT}`
  : "https://cyrpto.herokuapp.com";

setTimeout(() => {
  pubsub.broadcastChain();
}, 1000);

app.use(express.json());

app.get("/", (req, res) => {
  res.send({ getBlockchain: "/api/blocks", mineBlock: "/api/mine" });
});

app.get("/api/blocks", (req, res) => {
  res.send(blockchain.chain);
});

app.post("/api/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect("/api/blocks");
});

app.get("/api/transaction-pool-map", (req, res) => {
  res.send(transactionPool.transactionMap);
});

app.post("/api/transact", (req, res) => {
  const { amount, recipient } = req.body;
  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  });
  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransactions({
        recipient,
        amount,
        chain: blockchain.chain,
      });
    }
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }
  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);

  res.json({ type: "SUCCESSFULL TRANSACTION", message: transaction });
});

app.get("/api/mine-transactions", (req, res) => {
  transactionMiner.mineTranaction();
  res.redirect("/api/blocks");
});

app.get("/api/wallet-info", (req, res) => {
  const address = wallet.publicKey;
  console.log(`process.env.port : ${process.env.PORT}`);
  console.log(`root Node : ${ROOT_NODE}`);
  res.send({
    process: process.env.PORT,
    address,
    balance: Wallet.calculateBalance({ chain: blockchain.chain, address }),
  });
});

app.post("/api/deposit", (req, res) => {
  const { amount, recipient } = req.body;
  let transaction = transactionPool.existingTransaction({
    inputAddress: BANKWALLET.publicKey,
  });
  try {
    if (transaction) {
      transaction.update({ senderWallet: BANKWALLET, recipient, amount });
    } else {
      transaction = wallet.createTransactions({
        recipient,
        amount,
        chain: blockchain.chain,
      });
    }
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }
  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);

  res.json({ type: "SUCCESSFULLY DEPOSITED", message: transaction });
});

const syncRoot = () => {
  request({ url: `${ROOT_NODE}/api/blocks` }, (err, res, body) => {
    if (!err && res.statusCode === 200) {
      const rootChain = JSON.parse(body);
      console.log(`root chain is ${rootChain}`);
      blockchain.replaceChain(rootChain);
    }
  });
  request(
    { url: `${ROOT_NODE}/api/transaction-pool-map` },
    (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const rootTransactionPoolMap = JSON.parse(body);
        console.log(
          `replace transaction poolmap on a sync with ${rootTransactionPoolMap}`
        );
        transactionPool.setMap(rootTransactionPoolMap);
      }
    }
  );
};

let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
  if (PORT !== DEFAULT_PORT) {
    syncRoot();
  }
});
