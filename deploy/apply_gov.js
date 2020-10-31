const {ethers} = require("ethers");

// Deploys the token contract
async function deploy_apply_gov(taskArgs) {
  const hre = require("hardhat");
  const reg = require("./registry")(hre);

  let toWei = web3.utils.toWei;

  let vToken =
    await reg.getContract("VELODelegator");
  let rebaser = await reg.getContract("VELORebaser");
  let feeCharger = await reg.getContract("VELOFeeCharger");

  let gov = await reg.getContract("GovernorAlpha");
  let timeLock = await reg.getContract("Timelock");

  console.log("Transferring ownership");

  // For each of the Pools.
  let stakingPools = await reg.fetch("pool"); 
  for(label in stakingPools) {
    console.log("+ staking pool %s", label);
    let vsPool = 
      await reg.getPoolContract(label);

    // set reward distribution
    console.log("  ..set rewards distribution");
    await vsPool.setRewardDistribution(timeLock.address);

    // transfer ownership
    console.log("  ..transfer ownership");
    await vsPool.transferOwnership(timeLock.address);
  }

  // velo token
  console.log("+ velo token");
  await vToken._setPendingGov(timeLock.address);
  await timeLock.executeTransaction(
    vToken.address,
    0,
    "_acceptGov()",
    "0x",
    0
  );


  // rebaser
  console.log("+ rebaser");
  await rebaser.setGov(timeLock.address);

  // set the beneficiary, from this point on CHI
  // is charged on transactions
  console.log("+ feecharger");
  await feeCharger.setBeneficiary(timeLock.address);
  await feeCharger.setGov(timeLock.address);

  console.log("+ timelock");
  await timeLock.setPendingAdmin(gov.address);

  console.log("+ gov abdicate");
  await gov.__acceptAdmin();
  await gov.__abdicate();

}

module.exports = {deploy_apply_gov};
