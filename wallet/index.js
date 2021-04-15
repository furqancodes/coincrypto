const { STARTING_BALANCE } = require("../config");
const { ec } = require("../utils");

class Wallet {
  constructor() {
    const keyPair = ec.genKeyPair();
    this.balance = STARTING_BALANCE;
    this.publicKey = keyPair.getPublic().encode("hex");
  }
}
module.exports = Wallet;
