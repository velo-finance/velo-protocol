// Deploys the token contract
async function deploy_fund_staking_pools(taskArgs) {
  const hre = require("hardhat");
  const reg = require("./registry")(hre);

  let toWei = web3.utils.toWei;
  let stakingPools = await reg.fetch("pool"); 

  let TOTAL = 100000000;
  for(label in stakingPools) {

    let pool = stakingPools[label];
    let poolShare = TOTAL * parseFloat(pool["perc"]);

    console.log("Funding %s with %s", label, poolShare);

    // TimeLock
    let vToken =
      await reg.getContract("VELODelegator");
    let vsPool = 
      await reg.getPoolContract(label);

    // transferring
    if(!pool["funded"]) {
      await vToken.transfer(vsPool.address, toWei(poolShare.toString()));
      await reg.registerPoolEvent(label, "funded");
      console.log("  ..transferring velo");
    } else {
      console.log("  ..already funded");
    }

    // notify rewards, NOTE make sure POOL is not started yet!
    console.log("  ..notify reward amount");

    if(!pool["notified"]) {
      await vsPool.notifyRewardAmount(toWei(poolShare.toString()));
      await reg.registerPoolEvent(label, "notified");
    } else {
      console.log("  ..already notified");
    }
  }

}

module.exports = {deploy_fund_staking_pools};
