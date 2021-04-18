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
  createTransactions({ amount, recipient }) {
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
}
module.exports = Wallet;
