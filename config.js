module.exports = {
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
  MINE_RATE: 3000,
  STARTING_BALANCE: 0,
  BANK_WALLET: {
    privateKey: process.env.bank_wallet_private_key || '38d22e371e7176bcdf4281c4798e9c55457d438179940f19414d7d00780669d5',
    publicKey: process.env.bank_wallet_public_key ||
      '047c08ba522a3a3abc136611b13cad4ac422ba87226d85e7292f621dce2bb45b937b909dcb4eb5183f7b0b583f01f7a98d8b3f944976b720776a717f1a0a71a517',
  },
  DEFAULT_PORT: 3000,
  isDevelopment: process.env.ENV === 'development',
  PUBNUB: {
    publishKey:
      process.env.PUBLISH_KEY || 'pub-c-0cd2364e-dd3a-4632-b584-4bc1d23d68d2',
    subscribeKey:
      process.env.SUBSCRIBE_KEY || 'sub-c-8ce308c6-9ac0-11eb-8dfb-c2cb28a4a163',
    secretKey:
      process.env.SECRET_KEY ||
      'sec-c-ZDdiNGEwMGMtMTJkYS00MWJjLWFmM2QtNTYzMDMzZmIwNmRk',
  },
  url: 'http://localhost:3000/blockchain',
  APP: {
    CHANNELS: ['unconfirmed-blocks'],
  },
  MINER: {
    CHANNELS: ['transactions', 'confirmed-blocks'],
  },
  DATABASE: {
    URL: 'mongodb+srv://admin:W5uvoBSmjFpM1faE@cluster0.lfwbr.mongodb.net/cryptochain?retryWrites=true&w=majority',
  },
}
