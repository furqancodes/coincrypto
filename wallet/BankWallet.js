const { ec } = require("../utils");
const cryptoHash = require("../utils/cryptoHash");
const Transaction = require("./transaction");
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

  createDepositTransaction({ amount, recipient }) {
    const transaction = new Transaction({
      senderWallet: this,
      amount,
      recipient,
    });
    return transaction;
  }
}
module.exports = BankWallet;
