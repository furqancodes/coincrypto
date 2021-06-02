const PubNub = require("pubnub");

const config = require("../config");

const credentials = config.PUBNUB;

const CHANNELS = {
  TEST: "TEST",
  TRANSACTION: "TRANSACTION",
  BLOCK: "BLOCK",
};

class Pubsub {
  constructor({ transactionPool, wallet, block, method }) {
    this.block = block;
    this.wallet = wallet;
    this.method = method;
    this.transactionPool = transactionPool;
    this.pubnub = new PubNub(credentials);
    this.pubnub.subscribe({
      channels: [Object.values(CHANNELS)],
    });
    this.pubnub.addListener(this.listener());
  }
  listener() {
    return {
      message: (msg) => {
        const { channel, message } = msg;
        console.log(`successfully connected to ${channel} channel`, channel);
        console.log(`message ${message}`);
        const parsedMessage = JSON.parse(message);
        switch (channel) {
          case CHANNELS.TRANSACTION:
            if (
              !this.transactionPool.existingTransaction({
                inputAddress: this.wallet.publicKey,
              })
            ) {
              this.transactionPool.setTransaction(parsedMessage);
            }
            break;
          case CHANNELS.BLOCK:
            const verifiedBlock = this.method(this.block);
            if (verifiedBlock) {
              this.block.setblock(verifiedBlock);
            }
            break;
          default:
            break;
        }
      },
    };
  }
  subscribeToChannel() {
    this.pubnub.subscribe({
      channels: [Object.values(CHANNELS)],
    });
  }
  publish({ channel, message }) {
    this.pubnub
      .publish({ channel, message })
      .then(() => console.log("successful"))
      .catch((err) => console.error(err));
  }
  broadcastBlock({ block }) {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(block),
    });
  }
  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}

module.exports = Pubsub;
