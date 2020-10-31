async function deploy_governance(taskArgs) {
  const hre = require("hardhat");
  const reg = require("./registry")(hre);

  // TimeLock
  const Timelock = await ethers.getContractFactory("Timelock");
  const timelock = await Timelock.deploy();

  await timelock.deployed();

  await reg.store("Timelock", timelock.address);
  console.log("Timelock deployed to:", timelock.address);

  // GovernorAlpha
  const GovAlpha = await ethers.getContractFactory("GovernorAlpha");
  const govAlpha = await GovAlpha.deploy(timelock.address, reg.fetch("VELODelegator"));

  await govAlpha.deployed();

  await reg.store("GovernorAlpha", govAlpha.address);
  console.log("GovAlpha deployed to:", govAlpha.address);
};

module.exports = {deploy_governance};
