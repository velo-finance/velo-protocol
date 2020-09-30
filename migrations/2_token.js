// ============ Contracts ============

// Token
// deployed first
const VELOImplementation = artifacts.require("VELODelegate");
const VELOProxy = artifacts.require("VELODelegator");
const VELORebaser = artifacts.require("VELORebaser");
const FeeCharger = artifacts.require("FeeCharger");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployToken(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployToken(deployer, network) {
  await deployer.deploy(VELOImplementation);
  if (network != "mainnet") {
    await deployer.deploy(VELOProxy,
      "VELO",
      "VELO",
      18,
      "9000000000000000000000000", // print extra few mil for user
      VELOImplementation.address,
      "0x",
    );

    
  } else {
    await deployer.deploy(VELOProxy,
      "VELO",
      "VELO",
      18,
      "2000000000000000000000000",
      VELOImplementation.address,
      "0x"
    );
  }

  await deployer.deploy(VELORebaser,
    (await VELOProxy.deployed()).address
  );

  await (await VELOProxy.deployed())._setRebaser((await VELORebaser.deployed()).address)

  await deployer.deploy(FeeCharger,
    (await VELOProxy.deployed()).address
  );

}
