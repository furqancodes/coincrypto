const PubNub = require('pubnub')

const config = require('../config')
const credentials = config.PUBNUB
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
        try {
          const {channel, message} = msg
          console.info(`successfully connected to ${channel} channel`)
          console.info(`received messages on channel: ${channel} message: ${JSON.stringify(message)}`)
          await this.method({channel, message})
        } catch (err) {
          console.error(`error processing message ${err}`)
          throw err
        }
      },
    }
  }

  async publish({channel, message}) {
    try {
      console.info(`publishing messages on channel: ${channel} message: ${JSON.stringify(message)}`)
      await this.pubnub.publish({channel, message})
      console.info(`successfully published messages on channel: "${channel}"`)
    } catch (err) {
      console.error(`error publishing message on channel ${channel} | ${err}`)
      throw err
    }
  }
}
module.exports = Pubsub
