const PubNub = require('pubnub')

const config = require('../config')

const credentials = config.PUBNUB

const CHANNELS = {
  TEST: 'TEST',
  TRANSACTION: 'TRANSACTION',
}

class Pubsub {
  constructor({transactionPool, wallet}) {
    this.wallet = wallet
    this.transactionPool = transactionPool
    this.pubnub = new PubNub(credentials)
    this.pubnub.subscribe({
      channels: [Object.values(CHANNELS)],
    })
    this.pubnub.addListener(this.listener())
  }
  listener() {
    return {
      message: (msg) => {
        const {channel, message} = msg
        console.log(`successfully connected to ${channel} channel`, channel)
        console.table(`message------------------${message}`)
        const parsedMessage = JSON.parse(message)
        switch (channel) {
          case CHANNELS.TRANSACTION:
            if (
              !this.transactionPool.existingTransaction({
                inputAddress: this.wallet.publicKey,
              })
            ) {
              this.transactionPool.setTransaction(parsedMessage)
            }
            break
          default:
            break
        }
      },
    }
  }
  subscribeToChannel() {
    this.pubnub.subscribe({
      channels: [Object.values(CHANNELS)],
    })
  }
  publish({channel, message}) {
    this.pubnub
      .publish({channel, message})
      .then(() => console.log('successful'))
      .catch(err => console.error(err))
  }
  // broadcastChain() {
  //   this.publish({
  //     channel: CHANNELS.BLOCKCHAIN,
  //     message: JSON.stringify(this.blockchain.chain),
  //   })
  // }
  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    })
  }
}

module.exports = Pubsub
