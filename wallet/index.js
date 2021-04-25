const { STARTING_BALANCE } = require("../config");
const { ec } = require("../utils");
const cryptoHash = require("../utils/cryptoHash");
const Transactions = require("./transactions");

class Wallet {
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.balance = STARTING_BALANCE;
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }
  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }
  createTransactions({ amount, recipient, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey,
      });
    }
    if (amount > this.balance) {
      throw new Error("amount exceeds balance");
    }
    const transaction = new Transactions({
      senderWallet: this,
      amount,
      recipient,
    });
    return transaction;
  }
  static calculateBalance({ chain, address }) {
    let totalAmount = 0;
    for (let i = 1; i < chain.length; i++) {
      let { data } = chain[i];
      for (let j = 0; j < data.length; j++) {
        const { outputMap } = data[j];
        console.log(outputMap[address]);

        if (outputMap[address]) {
          console.log(outputMap[address]);
          totalAmount = totalAmount + outputMap[address];
        } else {
          totalAmount = totalAmount;
        }
      }
    }
    return STARTING_BALANCE + totalAmount;
  }
}
module.exports = Wallet;
