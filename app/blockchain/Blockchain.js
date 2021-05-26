const Block = require("./Block");
const { cryptoHash } = require("../utils");
const Transaction = require("../transaction/Transaction");
const { REWARD_ADDRESS, MINING_REWARD, BANK_WALLET } = require("../../config");
const Wallet = require("../Wallet");
const assert = require("assert");

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data,
    });
    this.chain.push(newBlock);
  }

  replaceChain(chain, validateTransactions, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error("incoming chain must be bigger");
      return;
    } else if (!Blockchain.isValidChain(chain)) {
      console.error("chain must be valid ");
      return;
    } else if (validateTransactions && !this.validTransactionData({ chain })) {
      console.error("The incoming chain has invalid data");
      return;
    } else if (onSuccess) {
      console.log("clearing Pool");
      onSuccess();
    }
    console.log("replacing chain with", chain);
    this.chain = chain;
  }

  validTransactionData({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();
      let rewardTransactionCount = 0;

      for (const transaction of block.data) {
        if (transaction.input.address === REWARD_ADDRESS.address) {
          rewardTransactionCount += 1;
          if (rewardTransactionCount > 1) {
            console.error("Miner rewards exceed limit");
            return false;
          } else if (
            Object.values(transaction.outputMap)[0] !== MINING_REWARD
          ) {
            console.error("Miner reward amount is invalid");
            return false;
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error("Invalid transaction");
            return false;
          }

          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address,
          });

          if (transaction.input.amount !== trueBalance) {
            console.error("Invalid input amount");
            return false;
          }

          if (transactionSet.has(transaction)) {
            console.error(
              "An identical transaction appears more than once in the block"
            );
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }

    return true;
  }

  validateBlock(block, pool) {
    const hash = this.chain[this.chain.length - 1].hash;
    const isValid = validateBlockHash(block, hash);

    // blockTransactions = [1,2,3,4,5,6,7,8,9]

    const blockTransactions = block.data.pop();
    const minerTrans = block.data.slice(block.data.length - 1);
    assert.deepStrictEqual(
      blockTransactions,
      pool.slice(0, blockTransactions.length)
    );

    const isBank = minerTrans.input === REWARD_ADDRESS;
    const isRewardAmount = minreTrans.amount === MINING_REWARD;
    if (isValid && isBank && isRewardAmount) {
      this.chain.push(block);
      broadCast(block);
    }
  }

  validateBlockHash({ block, hash }) {
    const realHash = cryptoHash(
      block.difficulty,
      block.nonce,
      block.data,
      block.lastHash,
      block.timestamp
    );
    realHash === hash ? true : false;
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }

    for (let i = 1; i < chain.length; i++) {
      if (chain[i].lastHash !== chain[i - 1].hash) {
        return false;
      }
      const lastDifficulty = chain[i - 1].difficulty;

      const realHash = cryptoHash(
        chain[i].data,
        chain[i].timestamp,
        chain[i].lastHash,
        chain[i].nonce,
        chain[i].difficulty
      );
      if (chain[i].hash !== realHash) {
        return false;
      }
      if (Math.abs(lastDifficulty - chain[i].difficulty) > 1) return false;
    }
    return true;
  }
}
module.exports = Blockchain;
