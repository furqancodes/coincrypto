const { v1: uuidv1 } = require("uuid");
const { verifySignature } = require("../utils");
class Transactions {
  constructor({ senderWallet, recipient, amount }) {
    this.id = uuidv1();
    this.outputMap = this.createOutputMap({
      senderWallet,
      recipient,
      amount,
    });
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }
  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }
  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }
  static validtransactions(transaction) {
    const { input, outputMap } = transaction;
    const { amount, address, signature } = input;
    const outputTotal = Object.values(outputMap).reduce(
      (total, outputAmt) => total + outputAmt
    );
    if (amount !== outputTotal) {
      return false;
    }
    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      return false;
    }
    return true;
  }
  update({ senderWallet, recipient, amount }) {
    this.outputMap[recipient] = amount;
    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }
}
module.exports = Transactions;
