const {time} = require('@openzeppelin/test-helpers');


const BN = web3.utils.toBN;

let PRECISION = (digits) => BN(10).pow(BN(digits));

// helpers
let BN_PRECISION = (v,p) => web3.utils.toBN(v).mul(PRECISION(p));
let BN_18 = (v) => BN_PRECISION(v, 18);

const ethers = require('ethers');
let BN_18_to_float = (bn) => { 
  return ethers.FixedNumber.fromValue(bn.toString(), 18).toUnsafeFloat() 
};
let BN18f = BN_18_to_float;


function getCurrentBlock() {
  return new Promise(function (fulfill, reject) {
    web3.eth.getBlockNumber(function (err, result) {
      if (err) reject(err);
      else fulfill(result);
    });
  });
}

function getCurrentBlockTime() {
  return new Promise(function (fulfill, reject) {
    web3.eth.getBlock('latest', false, function (err, result) {
      if (err) reject(err);
      else fulfill(result.timestamp);
    });
  });
}

async function mineBlocks(blocks) {
  for (let i = 0; i < blocks; i++) {
    await time.advanceBlock();
  }
}

module.exports = {BN_PRECISION, BN_18, PRECISION, BN_18_to_float, BN18f, getCurrentBlock, getCurrentBlockTime, mineBlocks};
