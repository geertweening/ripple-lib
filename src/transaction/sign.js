/* @flow */
'use strict';
const utils = require('./utils');
const keypairs = require('ripple-keypairs');
const binary = require('ripple-binary-codec');
const {computeBinaryTransactionHash} = require('ripple-hashes');
const validate = utils.common.validate;

function computeSignature(txJSON, privateKey) {
  const signingData = binary.encodeForSigning(txJSON);
  return keypairs.sign(signingData, privateKey);
}

function sign(txJSON: string, secret: string
): {signedTransaction: string; id: string} {
  validate.sign({txJSON, secret});
  // we can't validate that the secret matches the account because
  // the secret could correspond to the regular key

  const tx = JSON.parse(txJSON);

  if (tx.Signers === undefined) {
    const keypair = keypairs.deriveKeypair(secret);
    if (tx.SigningPubKey === undefined) {
      tx.SigningPubKey = keypair.publicKey;
    }
    tx.TxnSignature = computeSignature(tx, keypair.privateKey);
  } else {
    tx.SigningPubKey = '';
  }

  const serialized = binary.encode(tx);

  return {
    signedTransaction: serialized,
    id: computeBinaryTransactionHash(serialized)
  };
}

module.exports = sign;
