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
    privateKey: process.env.bank_wallet_private_key || '1',
    publicKey: process.env.bank_wallet_public_key || '2',
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
  url: 'https://cyrpto.herokuapp.com/blockchain',
}
