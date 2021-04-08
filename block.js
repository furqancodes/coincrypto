const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./cryptoHash");
class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    (this.hash = hash),
      (this.data = data),
      (this.timestamp = timestamp),
      (this.lastHash = lastHash),
      (this.nonce = nonce),
      (this.difficulty = difficulty);
  }
  static genesis() {
    return new this(GENESIS_DATA);
  }
  static mineBlock({ lastBlock, data }) {
    let hash, timestamp;
    const lastHash = lastBlock.hash;
    const { difficulty } = lastBlock;
    let nonce = 0;
    do {
      nonce++,
        (timestamp = Date.now),
        (hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty));
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));
    return new Block({ timestamp, lastHash, data, hash, nonce, difficulty });
  }
}
module.exports = Block;
