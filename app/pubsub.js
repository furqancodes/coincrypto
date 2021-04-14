const PubNub = require("pubnub");

require("dotenv").config();

const credentials = {
  publishKey: process.env.PUBLISHKEY,
  subscribeKey: process.env.SUBSCRIBEKEY,
  secretKey: process.env.SECRETKEY,
};
console.log(credentials);
const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
};

class PubSub {
  constructor({ blockchain }) {
    this.blockchain = blockchain;
    this.pubnub = new PubNub(credentials);
    this.pubnub.subscribe({
      channels: [Object.values(CHANNELS)],
    });
    this.pubnub.addListener(this.listener());
  }
  listener() {
    return {
      message: (msgObj) => {
        const { channel, message } = msgObj;
        console.log(`SUCEESSfully conncected to ${channel} channel`, channel);
        console.table(`message------------------${message}`);
        const parsedMessage = JSON.parse(message);
        if (channel === CHANNELS.BLOCKCHAIN) {
          this.blockchain.replaceChain(parsedMessage);
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
      .then(() => console.log("sucessful"))
      .catch((err) => console.error(err));
  }
  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }
}

module.exports = PubSub;
