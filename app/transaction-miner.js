class TransactionMiner {
  constructor({ blockchain, transactionPool, wallet, pubsub }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }
  mineTranaction() {
    // get valid transaction
    // genertae miner reward
    //add block consisting of these transaction to the blockchain
    //broadcast the updated blockchain
    //clear the pool
  }
}

module.exports = TransactionMiner;
