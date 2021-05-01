const { ec } = require("../utils");
const cryptoHash = require("../utils/cryptoHash");
const Transactions = require("./transactions");
const Wallet = require("./index");
class BankWallet {
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.balance = 0;
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }
  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }
  static createWallet() {
    const wallet = new Wallet();
    return wallet;
  }
  createDepositTransactions({ amount, recipient }) {
    const transaction = new Transactions({
      senderWallet: this,
      amount,
      recipient,
    });
    return transaction;
  }
}
module.exports = BankWallet;
