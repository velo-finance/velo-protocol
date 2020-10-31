const {getContractOrDeploy}  = require("./utils");

async function deploy_token(taskArgs) {
  const hre = require("hardhat");
  const reg = require("./registry")(hre);

  // NOTE: Mainnet deployment must continue
  let veloImplementation = await getContractOrDeploy(reg, "VELODelegate");

  // VELO
  let velo = await getContractOrDeploy(reg, "VELODelegator",
    "VELO Token", "VLO", 18,
    web3.utils.toWei("100000100"), 
    veloImplementation.address, "0x"
  );

  // VELORebaser
  let veloRebaser = await getContractOrDeploy(reg, "VELORebaser", velo.address, taskArgs.rebaseInterval, taskArgs.rebaseStart);

  // VELOFeeCharger
  let veloFeeCharger = await getContractOrDeploy(reg, "VELOFeeCharger", velo.address);

  // Configuring FeeCharger and Rebaser
  await velo.setRebaser(veloRebaser.address);
  await velo.setFeeCharger(veloFeeCharger.address);

  console.log("VELO{Rebaser,FeeCharger} configured");
}

module.exports = {deploy_token};
