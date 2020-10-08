// ============ Contracts ============

const VELOProxy = artifacts.require("VELODelegator");
const FeeCharger = artifacts.require("FeeCharger");
const VELORebaser = artifacts.require("VELORebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployDistribution(deployer, network, accounts),
  ]);
}

module.exports = migration;

// ============ Deploy Functions ============


async function deployDistribution(deployer, network, accounts) {
  console.log(network)
  let velo = await VELOProxy.deployed();
  // let yReserves = await VELOReserves.deployed()
  let yRebaser = await VELORebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  let feeCharger = await FeeCharger.deployed();

    await Promise.all([
      velo.setFeeCharger(feeCharger.address)
    ]);

  await feeCharger.setGovFactor("1000000000000000000");
  await feeCharger.setBeneficiary(Timelock.address);
  await feeCharger.setGov(Timelock.address);

  await Promise.all([
    yRebaser.setGov(Timelock.address),
  ]);

  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await gov.__abdicate();
}
