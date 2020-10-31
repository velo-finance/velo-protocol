// Deploys the token contract
async function deploy_staking_pool(taskArgs) {
  const hre = require("hardhat");
  const reg = require("./registry")(hre);

  let poolInfo = await reg.pool(taskArgs.label)
  if(poolInfo) {
    console.log("%s already deployed", taskArgs.label);
    return;
  }

  const vToken = await reg.getContract("VELODelegator");

  // TimeLock
  const VELOStakingPool = await ethers.getContractFactory("VELOStakingPool");
  const vsPool = await VELOStakingPool.deploy(
    vToken.address,
    taskArgs.stakingTokenAddr,
    taskArgs.startTime,
    taskArgs.duration
  );

  await vsPool.deployed();

  reg.store_pool(
    taskArgs.label,
    {label: taskArgs.label,
      address: vsPool.address,
      stakingToken: taskArgs.stakingToken,
      starttime: taskArgs.startTime,
      duration: taskArgs.duration,
      perc: taskArgs.perc
    });
  console.log("StakingPool %s is deployed to:", taskArgs.label, vsPool.address);

  let [deployer] = await ethers.getSigners();
  await vsPool.setRewardDistribution(deployer.address);
}

module.exports = {deploy_staking_pool};
