const Transaction = require('../transaction/Transaction')
class Miner {
  constructor({blockchain, transactionPool, wallet, pubsub}) {
    this.blockchain = blockchain
    this.transactionPool = transactionPool
    this.wallet = wallet
    this.pubsub = pubsub
  }
  mineTransaction() {
    // get valid transaction
    const validTransactions = this.transactionPool.validTransactions()

    // generate miner reward
    validTransactions.push(
      Transaction.rewardTransaction({
        minerWallet: this.wallet,
      })
    )
    // add block consisting of these transaction to the blockchain
    this.blockchain.addBlock({data: validTransactions})
    // broadcast the updated blockchain
    this.pubsub.broadcastChain()
    // clear the pool
    this.transactionPool.clear()
  }
}

module.exports = Miner
