
const Block = require('./Block')
const {cryptoHash} = require('../utils')
const Transaction = require('../transaction/Transaction')
const {REWARD_ADDRESS, MINING_REWARD, BANK_WALLET} = require('../../config')
const Wallet = require('../Wallet')
const Blocks = require('../db/models/Blocks')

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()]
  }

  addBlock({data}) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data,
    })
    this.chain.push(newBlock)
    return newBlock
  }

  validTransactionData({chain}) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i]
      const transactionSet = new Set()
      let rewardTransactionCount = 0

      for (const transaction of block.data) {
        if (transaction.input.address === REWARD_ADDRESS.address) {
          rewardTransactionCount += 1
          if (rewardTransactionCount > 1) {
            console.error('Miner rewards exceed limit')
            return false
          } else if (
            Object.values(transaction.outputMap)[0] !== MINING_REWARD
          ) {
            console.error('Miner reward amount is invalid')
            return false
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error('Invalid transaction')
            return false
          }

          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address,
          })

          if (transaction.input.amount !== trueBalance) {
            console.error('Invalid input amount')
            return false
          }

          if (transactionSet.has(transaction)) {
            console.error(
              'An identical transaction appears more than once in the block'
            )
            return false
          } else {
            transactionSet.add(transaction)
          }
        }
      }
    }

    return true
  }

  lastBlockHash() {
    return this.chain[this.chain.length - 1].hash
  }

  async loadBlocks() {
    const blocks = await Blocks.find({}).sort({_id: 1})
    blocks.forEach(block => this.chain.push(block.toJSON().data))
    console.info(`loaded ${blocks.length} blocks into chain`)
  }

  async validateAndAddBlock(block, transactionPool) {
    const validTransaction = transactionPool.validTransactions()
    const rewardTransaction = block.data[block.data.length - 1]
    const data = validTransaction.slice(validTransaction.length - block.data.length)
    data.push(rewardTransaction)

    const isValidBlock = this.isValidBlock(block, data)
    const isValidReward = this.isValidReward(rewardTransaction)
    console.info(`isValidBlock: ${isValidBlock} isValidReward: ${isValidReward}`)

    if (isValidBlock && isValidReward) {
      this.chain.push(block)
      await new Blocks({data: block}).save()
      console.info('new block saved in db')
      data.forEach((transaction) => {
        transactionPool.removeTransaction(transaction.id)
      })
    }
  }

  isValidReward(rewardTransaction) {
    if (rewardTransaction.input.address === BANK_WALLET.publicKey &&
      rewardTransaction.outputMap[Object.keys(rewardTransaction.outputMap).shift()] === MINING_REWARD) return true
    return false
  }

  isValidBlock(block, data) {
    const realHash = cryptoHash(
      block.timestamp,
      this.lastBlockHash(),
      data,
      block.nonce,
      block.difficulty
    )
    return block.hash === realHash ? true : false
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false
    }

    for (let i = 1; i < chain.length; i++) {
      if (chain[i].lastHash !== chain[i - 1].hash) {
        return false
      }
      const lastDifficulty = chain[i - 1].difficulty

      const realHash = cryptoHash(
        chain[i].data,
        chain[i].timestamp,
        chain[i].lastHash,
        chain[i].nonce,
        chain[i].difficulty
      )
      if (chain[i].hash !== realHash) {
        return false
      }
      if (Math.abs(lastDifficulty - chain[i].difficulty) > 1) return false
    }
    return true
  }
}
module.exports = Blockchain
