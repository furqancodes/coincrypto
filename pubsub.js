const PubNub = require("pubnub");

const credentials = {
  publishKey: "pub-c-0cd2364e-dd3a-4632-b584-4bc1d23d68d2",
  subscribeKey: "sub-c-8ce308c6-9ac0-11eb-8dfb-c2cb28a4a163",
  secretKey: "sec-c-ZDdiNGEwMGMtMTJkYS00MWJjLWFmM2QtNTYzMDMzZmIwNmRk",
};

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
