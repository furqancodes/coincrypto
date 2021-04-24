const Block = require("./block");
const cryptoHash = require("../utils/cryptoHash.js");
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
  replaceChain(chain, onSuccess) {
    if (chain.length <= this.chain.length) {
      console.error("chain must be bigger");
      return;
    }
    if (!Blockchain.isValidChain(chain)) {
      console.error("chain must be valid ");
      return;
    }
    if (onSuccess) {
      onSuccess();
    }
    console.log("replacing chain with", chain);
    this.chain = chain;
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
