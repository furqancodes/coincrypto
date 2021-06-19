
const isDevelopment = process.env.NODE_ENV === 'development'
module.exports = {
  isDevelopment,
  STARTING_BALANCE: 0,
  MINE_RATE: 3000,
  MINING_REWARD: 50,
  REWARD_ADDRESS: {address: '*authorized-reward*'},
  GENESIS_DATA: {
    timestamp: 1,
    lastHash: '-----',
    hash: 'hash-one',
    difficulty: 3,
    nonce: 0,
    data: [],
  },
  BANK_WALLET: {
    privateKey: process.env.bank_wallet_private_key,
    publicKey: process.env.bank_wallet_public_key,
  },
  DEFAULT_PORT: isDevelopment ? 3000 : process.env.PORT,
  PUBNUB: {
    publishKey:
      process.env.pubnub_publish_key,
    subscribeKey:
      process.env.pubnub_subscribe_key,
    secretKey:
      process.env.pubnub_secret_key,
  },
  URL: isDevelopment ? 'http://localhost:3000' : 'https://coincrypto-app.herokuapp.com',
  CHANNELS: {
    APP: ['unconfirmed-blocks'],
    MINER: ['transactions', 'confirmed-blocks'],
  },
  DATABASE: {
    URL: process.env.database_url,
  },
}
