const request = require("request");
const express = require("express");
const Blockchain = require("./blockchain/index");
const PubSub = require("./app/pubsub");
const Transactionpool = require("./wallet/transaction-pool");
const Wallet = require("./wallet");

const app = express();
const blockchain = new Blockchain();
const transactionPool = new Transactionpool();
const wallet = new Wallet();
const pubsub = new PubSub({ wallet, blockchain, transactionPool });

const DEFAULT_PORT = 3000;
const ROOT_NODE = `http://localhost:${DEFAULT_PORT}`;

setTimeout(() => {
  pubsub.broadcastChain();
}, 1000);

app.use(express.json());

app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/api/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect("/api/blocks");
});

app.get("/api/transaction-pool-map", (req, res) => {
  res.json(transactionPool.transactionMap);
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
      transaction = wallet.createTransactions({ recipient, amount });
    }
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }
  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);

  res.json({ type: "SUCCESSFULL TRANSACTION", message: transaction });
});

const syncChain = () => {
  request({ url: `${ROOT_NODE}/api/blocks` }, (err, res, body) => {
    if (!err && res.statusCode === 200) {
      const rootChain = JSON.parse(body);
      console.log(`root chain is ${rootChain}`);
      blockchain.replaceChain(rootChain);
    }
  });
};

let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
  if (PORT !== DEFAULT_PORT) {
    syncChain();
  }
});
