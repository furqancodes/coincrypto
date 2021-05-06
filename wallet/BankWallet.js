const { ec } = require("../utils");
const cryptoHash = require("../utils/cryptoHash");
const Transaction = require("./transaction");
const Wallet = require("./index");

class BankWallet {
  constructor(privateKey) {
    this.key = ec.keyFromPrivate(privateKey);
    console.log("🚀 key", this.key);
    this.keyPair = ec.genKeyPair();
    console.log("🚀 keyPair", this.keyPair);
    this.balance = 0;
    this.publicKey = this.keyPair.getPublic().encode("hex");
    // this.privatekey = this.keyPair.getPrivate().toString();
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
