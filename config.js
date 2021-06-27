
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
  MINER_WALLET: {
    privateKey: process.env.miner_private_key,
    publicKey: process.env.miner_public_key,
  },
  DEFAULT_PORT: isDevelopment ? 3000 : process.env.PORT,
  PUBNUB: {
    publishKey: isDevelopment ? 'pub-c-816b3658-70c2-4b99-9cb4-4458ec970ee5' :process.env.pubnub_publish_key,
    subscribeKey: isDevelopment ? 'sub-c-a71239be-d220-11eb-b6c2-0298fc8e4944' :process.env.pubnub_subscribe_key,
    secretKey: isDevelopment ? 'sec-c-MjBmNDQ4ODAtM2JjYy00MzY4LWIwZDMtYjZjZjEwOWYwODJl' :process.env.pubnub_secret_key,
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
