const PubNub = require('pubnub')

const config = require('../config')
const credentials = config.PUBNUB
// const CHANNELS = {
//   TEST: 'TEST',
//   TRANSACTION: 'TRANSACTION',
//   BLOCK: 'BLOCK',
// }
class Pubsub {
  constructor({method, channels}) {
    this.pubnub = new PubNub(credentials)
    this.method = method
    this.pubnub.addListener(this.listener())
    this.pubnub.subscribe({channels})
  }
  listener() {
    return {
      message: async (msg) => {
        const {channel, message} = msg
        console.log(`successfully connected to ${channel} channel`, channel)
        console.log(`received messages on channel: "${channel}" message: ${JSON.stringify(message)}`)
        await this.method({channel, message})
      },
    }
  }

  async publish({channel, message}) {
    try {
      console.log(`publishing messages on channel: "${channel}" message: ${JSON.stringify(message)}`)
      await this.pubnub.publish({channel, message})
      console.log(`successfully published messages on channel: "${channel}"`)
    } catch (err) {
      console.error(err)
    }
  }
  // broadcastBlock({block}) {
  //   this.publish({
  //     channel: CHANNELS.BLOCKCHAIN,
  //     message: JSON.stringify(block),
  //   })
  // }
  // broadcastTransaction(transaction) {
  //   this.publish({
  //     channel: CHANNELS.TRANSACTION,
  //     message: JSON.stringify(transaction),
  //   })
  // }
}
module.exports = Pubsub
