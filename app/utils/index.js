const crypto = require('crypto')

const EC = require('elliptic').ec

const ec = new EC('secp256k1')

const cryptoHash = (...inputs) => {
  const hash = crypto.createHash('sha256')
  hash.update(
    inputs
      .map(input => JSON.stringify(input))
      .sort()
      .join(' ')
  )
  return hash.digest('hex')
}

const verifySignature = ({signature, data, publicKey}) => {
  const keyFromPublic = ec.keyFromPublic(publicKey, 'hex')
  const msghash = cryptoHash(data)
  return keyFromPublic.verify(msghash, signature)
}

module.exports = {ec, verifySignature, cryptoHash}
