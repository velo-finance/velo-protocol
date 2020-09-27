// ============ Contracts ============

// Token
// deployed first
const VELOImplementation = artifacts.require("VELODelegate");
const VELOProxy = artifacts.require("VELODelegator");

// Rs
// deployed second
const VELOReserves = artifacts.require("VELOReserves");
const VELORebaser = artifacts.require("VELORebaser");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployRs(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployRs(deployer, network) {
  let reserveToken = "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8";
  let uniswap_factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  await deployer.deploy(VELOReserves, reserveToken, VELOProxy.address);
  await deployer.deploy(VELORebaser,
      VELOProxy.address,
      reserveToken,
      uniswap_factory,
      VELOReserves.address
  );
  let rebase = new web3.eth.Contract(VELORebaser.abi, VELORebaser.address);

  let pair = await rebase.methods.uniswap_pair().call();
  console.log(pair)
  let yam = await VELOProxy.deployed();
  await yam._setRebaser(VELORebaser.address);
  let reserves = await VELOReserves.deployed();
  await reserves._setRebaser(VELORebaser.address)
}
