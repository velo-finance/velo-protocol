import {ethers} from 'ethers'

import BigNumber from 'bignumber.js'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 200000,
    SNX: 850000,
  }
};

export const getPoolStartTime = async (poolContract) => {
  return await poolContract.methods.starttime().call()
}

export const stake = async (poolContract, amount, account, tokenName) => {
  let now = new Date().getTime() / 1000;
  const gas = GAS_LIMIT.STAKING[tokenName.toUpperCase()] || GAS_LIMIT.STAKING.DEFAULT;
  if (now >= 1597172400) {
    return poolContract.methods
      .stake((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const unstake = async (poolContract, amount, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .withdraw((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const harvest = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .getReward()
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const redeem = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .exit()
      .send({ from: account, gas: 400000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const approve = async (tokenContract, poolContract, account) => {
  return tokenContract.methods
    .approve(poolContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account, gas: 80000 })
}

export const getPoolContracts = async (velo) => {
  const pools = Object.keys(velo.contracts)
    .filter(c => c.indexOf('_pool') !== -1)
    .reduce((acc, cur) => {
      const newAcc = { ...acc }
      newAcc[cur] = velo.contracts[cur]
      return newAcc
    }, {})
  return pools
}

export const getEarned = async (velo, pool, account) => {
  const scalingFactor = new BigNumber(await velo.contracts.velo.methods.velosScalingFactor().call())
  const earned = new BigNumber(await pool.methods.earned(account).call())
  return earned.multipliedBy(scalingFactor.dividedBy(new BigNumber(10).pow(18)))
}

export const getStaked = async (velo, pool, account) => {
  return velo.toBigN(await pool.methods.balanceOf(account).call())
}

export const getCurrentPrice = async (velo) => {
  // FORBROCK: get current VELO price
  return velo.toBigN(await velo.contracts.rebaser.methods.getCurrentTWAP().call())
}

export const getTargetPrice = async (velo) => {
  return velo.toBigN(1).toFixed(2);
}

export const getCirculatingSupply = async (velo) => {
  let now = await velo.web3.eth.getBlock('latest');
  let scalingFactor = velo.toBigN(await velo.contracts.velo.methods.velosScalingFactor().call());
  let starttime = velo.toBigN(await velo.contracts.eth_pool.methods.starttime().call()).toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let velosDistributed = velo.toBigN(8 * timePassed * 250000 / 625000); //velos from first 8 pools
  let starttimePool2 = velo.toBigN(await velo.contracts.ycrv_pool.methods.starttime().call()).toNumber();
  timePassed = now["timestamp"] - starttime;
  let pool2Yams = velo.toBigN(timePassed * 1500000 / 625000); // velos from second pool. note: just accounts for first week
  let circulating = pool2Yams.plus(velosDistributed).times(scalingFactor).div(10**36).toFixed(2)
  return circulating
}

export const getNextRebaseTimestamp = async (velo) => {
  try {
    let now = await velo.web3.eth.getBlock('latest').then(res => res.timestamp);
    let interval = 43200; // 12 hours
    let offset = 28800; // 8am/8pm utc
    let secondsToRebase = 0;
    if (await velo.contracts.rebaser.methods.rebasingActive().call()) {
      if (now % interval > offset) {
          secondsToRebase = (interval - (now % interval)) + offset;
       } else {
          secondsToRebase = offset - (now % interval);
      }
    } else {
      let twap_init = velo.toBigN(await velo.contracts.rebaser.methods.timeOfTWAPInit().call()).toNumber();
      if (twap_init > 0) {
        let delay = velo.toBigN(await velo.contracts.rebaser.methods.rebaseDelay().call()).toNumber();
        let endTime = twap_init + delay;
        if (endTime % interval > offset) {
            secondsToRebase = (interval - (endTime % interval)) + offset;
         } else {
            secondsToRebase = offset - (endTime % interval);
        }
        return endTime + secondsToRebase;
      } else {
        return now + 13*60*60; // just know that its greater than 12 hours away
      }
    }
    return secondsToRebase
  } catch (e) {
    console.log(e)
  }
}

export const getTotalSupply = async (velo) => {
  return await velo.contracts.velo.methods.totalSupply().call();
}

export const getStats = async (velo) => {
  const curPrice = await getCurrentPrice(velo)
  const circSupply = await getCirculatingSupply(velo)
  const nextRebase = await getNextRebaseTimestamp(velo)
  const targetPrice = await getTargetPrice(velo)
  const totalSupply = await getTotalSupply(velo)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}

export const vote = async (velo, account) => {
  return velo.contracts.gov.methods.castVote(0, true).send({ from: account })
}

export const delegate = async (velo, account) => {
  return velo.contracts.velo.methods.delegate("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84").send({from: account, gas: 320000 })
}

export const didDelegate = async (velo, account) => {
  return await velo.contracts.velo.methods.delegates(account).call() === '0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84'
}

export const getVotes = async (velo) => {
  const votesRaw = new BigNumber(await velo.contracts.velo.methods.getCurrentVotes("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84").call()).div(10**24)
  return votesRaw
}

export const getScalingFactor = async (velo) => {
  return new BigNumber(await velo.contracts.velo.methods.velosScalingFactor().call())
}

export const getDelegatedBalance = async (velo, account) => {
  return new BigNumber(await velo.contracts.velo.methods.balanceOfUnderlying(account).call()).div(10**24)
}

export const migrate = async (velo, account) => {
  return velo.contracts.veloV2migration.methods.migrate().send({ from: account, gas: 320000 })
}

export const getMigrationEndTime = async (velo) => {
  return velo.toBigN(await velo.contracts.veloV2migration.methods.startTime().call()).plus(velo.toBigN(86400*3)).toNumber()
}

export const getV2Supply = async (velo) => {
  return new BigNumber(await velo.contracts.veloV2.methods.totalSupply().call())
}