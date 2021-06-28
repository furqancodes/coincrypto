const Transaction = require('../transaction/Transaction')
const Wallet = require('../Wallet')
const {MINING_REWARD} = require('../../config')
class Miner {
  constructor({blockchain, transactionPool, bankWallet, minerWallet, pubsub}) {
    this.blockchain = blockchain
    this.transactionPool = transactionPool
    this.bankWallet = bankWallet
    this.minerWallet = minerWallet
    this.pubsub = pubsub
  }
  mineTransaction() {
    const validTransactions = this.transactionPool.validTransactions()
    if (validTransactions.length > 0) {
      validTransactions.push(
        new Transaction({
          senderWallet: this.bankWallet,
          recipient: this.minerWallet.publicKey,
          amount: MINING_REWARD,
        })
      )

      const block = this.blockchain.addBlock({data: validTransactions})
      this.pubsub.publish({channel: 'unconfirmed-blocks', message: block})
      this.bankWallet.balance = Wallet.calculateBalance({chain: this.blockchain.chain, address: this.bankWallet.publicKey})
      this.minerWallet.balance = Wallet.calculateBalance({chain: this.blockchain.chain, address: this.minerWallet.publicKey})
      this.transactionPool.clear()
    }
    console.info('transaction pool empty')
  }
}

module.exports = Miner
