// ============ Contracts ============


// Protocol
// deployed second
const VELOImplementation = artifacts.require("VELODelegate");
const VELOProxy = artifacts.require("VELODelegator");

// deployed third
const VELOReserves = artifacts.require("VELOReserves");
const VELORebaser = artifacts.require("VELORebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// deployed fourth
const VELO_ETHPool = artifacts.require("VELOETHPool");
const VELO_uAMPLPool = artifacts.require("VELOAMPLPool");
const VELO_YFIPool = artifacts.require("VELOYFIPool");
const VELO_LINKPool = artifacts.require("VELOLINKPool");
const VELO_MKRPool = artifacts.require("VELOMKRPool");
const VELO_LENDPool = artifacts.require("VELOLENDPool");
const VELO_COMPPool = artifacts.require("VELOCOMPPool");
const VELO_SNXPool = artifacts.require("VELOSNXPool");


// deployed fifth
const VELOIncentivizer = artifacts.require("VELOIncentivizer");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    // deployTestContracts(deployer, network),
    deployDistribution(deployer, network, accounts),
    // deploySecondLayer(deployer, network)
  ]);
}

module.exports = migration;

// ============ Deploy Functions ============


async function deployDistribution(deployer, network, accounts) {
  console.log(network)
  let yam = await VELOProxy.deployed();
  let yReserves = await VELOReserves.deployed()
  let yRebaser = await VELORebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  if (network != "test") {
    await deployer.deploy(VELO_ETHPool);
    await deployer.deploy(VELO_uAMPLPool);
    await deployer.deploy(VELO_YFIPool);
    await deployer.deploy(VELOIncentivizer);
    await deployer.deploy(VELO_LINKPool);
    await deployer.deploy(VELO_MKRPool);
    await deployer.deploy(VELO_LENDPool);
    await deployer.deploy(VELO_COMPPool);
    await deployer.deploy(VELO_SNXPool);

    let eth_pool = new web3.eth.Contract(VELO_ETHPool.abi, VELO_ETHPool.address);
    let ampl_pool = new web3.eth.Contract(VELO_uAMPLPool.abi, VELO_uAMPLPool.address);
    let yfi_pool = new web3.eth.Contract(VELO_YFIPool.abi, VELO_YFIPool.address);
    let lend_pool = new web3.eth.Contract(VELO_LENDPool.abi, VELO_LENDPool.address);
    let mkr_pool = new web3.eth.Contract(VELO_MKRPool.abi, VELO_MKRPool.address);
    let snx_pool = new web3.eth.Contract(VELO_SNXPool.abi, VELO_SNXPool.address);
    let comp_pool = new web3.eth.Contract(VELO_COMPPool.abi, VELO_COMPPool.address);
    let link_pool = new web3.eth.Contract(VELO_LINKPool.abi, VELO_LINKPool.address);
    let ycrv_pool = new web3.eth.Contract(VELOIncentivizer.abi, VELOIncentivizer.address);

    console.log("setting distributor");
    await Promise.all([
        eth_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        ampl_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        yfi_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        ycrv_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        lend_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        mkr_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        snx_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        comp_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        link_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
        ycrv_pool.methods.setRewardDistribution(accounts[0]).send({from: accounts[0], gas: 100000}),
      ]);

    let two_fifty = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(250));
    let one_five = two_fifty.mul(web3.utils.toBN(6));

    console.log("transfering and notifying");
    console.log("eth");
    await Promise.all([
      yam.transfer(VELO_ETHPool.address, two_fifty.toString()),
      yam.transfer(VELO_uAMPLPool.address, two_fifty.toString()),
      yam.transfer(VELO_YFIPool.address, two_fifty.toString()),
      yam.transfer(VELO_LENDPool.address, two_fifty.toString()),
      yam.transfer(VELO_MKRPool.address, two_fifty.toString()),
      yam.transfer(VELO_SNXPool.address, two_fifty.toString()),
      yam.transfer(VELO_COMPPool.address, two_fifty.toString()),
      yam.transfer(VELO_LINKPool.address, two_fifty.toString()),
      yam._setIncentivizer(VELOIncentivizer.address),
    ]);

    await Promise.all([
      eth_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      ampl_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      yfi_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      lend_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      mkr_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      snx_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      comp_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),
      link_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:accounts[0]}),

      // incentives is a minter and prepopulates itself.
      ycrv_pool.methods.notifyRewardAmount("0").send({from: accounts[0], gas: 500000}),
    ]);

    await Promise.all([
      eth_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      ampl_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      yfi_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      lend_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      mkr_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      snx_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      comp_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      link_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
      ycrv_pool.methods.setRewardDistribution(Timelock.address).send({from: accounts[0], gas: 100000}),
    ]);
    await Promise.all([
      eth_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      ampl_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      yfi_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      lend_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      mkr_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      snx_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      comp_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      link_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
      ycrv_pool.methods.transferOwnership(Timelock.address).send({from: accounts[0], gas: 100000}),
    ]);
  }

  await Promise.all([
    yam._setPendingGov(Timelock.address),
    yReserves._setPendingGov(Timelock.address),
    yRebaser._setPendingGov(Timelock.address),
  ]);

  await Promise.all([
      tl.executeTransaction(
        VELOProxy.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        VELOReserves.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        VELORebaser.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),
  ]);
  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await gov.__abdicate();
}
