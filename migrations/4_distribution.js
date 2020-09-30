// ============ Contracts ============


// Protocol
// deployed second
// const VELOImplementation = artifacts.require("VELODelegate");
const VELOProxy = artifacts.require("VELODelegator");
const FeeCharger = artifacts.require("FeeCharger");

// deployed third
//const VELOReserves = artifacts.require("VELOReserves");
const VELORebaser = artifacts.require("VELORebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// deployed fourth
//const VELO_ETHPool = artifacts.require("VELOETHPool");
//const VELO_uAMPLPool = artifacts.require("VELOAMPLPool");
//const VELO_YFIPool = artifacts.require("VELOYFIPool");
const VELO_LINKPool = artifacts.require("VELOLINKPool");
//const VELO_MKRPool = artifacts.require("VELOMKRPool");
//const VELO_LENDPool = artifacts.require("VELOLENDPool");
//const VELO_COMPPool = artifacts.require("VELOCOMPPool");
//const VELO_SNXPool = artifacts.require("VELOSNXPool");


// deployed fifth
// const VELOIncentivizer = artifacts.require("VELOIncentivizer");

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
  let velo = await VELOProxy.deployed();
  // let yReserves = await VELOReserves.deployed()
  let yRebaser = await VELORebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  let feeCharger = await FeeCharger.deployed();

  if (network != "test") {
    //await deployer.deploy(VELO_ETHPool);
    //await deployer.deploy(VELO_uAMPLPool);
    //await deployer.deploy(VELO_YFIPool);
    //await deployer.deploy(VELOIncentivizer);
    await deployer.deploy(VELO_LINKPool);
    //await deployer.deploy(VELO_MKRPool);
    //await deployer.deploy(VELO_LENDPool);
    //await deployer.deploy(VELO_COMPPool);
    //await deployer.deploy(VELO_SNXPool);

    //let eth_pool = new web3.eth.Contract(VELO_ETHPool.abi, VELO_ETHPool.address);
    //let ampl_pool = new web3.eth.Contract(VELO_uAMPLPool.abi, VELO_uAMPLPool.address);
    //let yfi_pool = new web3.eth.Contract(VELO_YFIPool.abi, VELO_YFIPool.address);
    //let lend_pool = new web3.eth.Contract(VELO_LENDPool.abi, VELO_LENDPool.address);
    //let mkr_pool = new web3.eth.Contract(VELO_MKRPool.abi, VELO_MKRPool.address);
    // let snx_pool = new web3.eth.Contract(VELO_SNXPool.abi, VELO_SNXPool.address);
    // let comp_pool = new web3.eth.Contract(VELO_COMPPool.abi, VELO_COMPPool.address);
    let link_pool = new web3.eth.Contract(VELO_LINKPool.abi, VELO_LINKPool.address);
    // let ycrv_pool = new web3.eth.Contract(VELOIncentivizer.abi, VELOIncentivizer.address);

    console.log("setting distributor");
    console.log("linkpool address", VELO_LINKPool.address);
    console.log("getting owner");
    console.log(await link_pool.methods.owner().call());
    console.log("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3");

    await Promise.all([
        // eth_pool.methods.setRewardDistribution("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3").send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
        // ampl_pool.methods.setRewardDistribution("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3").send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
        // yfi_pool.methods.setRewardDistribution("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3").send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
        // ycrv_pool.methods.setRewardDistribution("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3").send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
        // lend_pool.methods.setRewardDistribution("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3").send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
        // mkr_pool.methods.setRewardDistribution("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3").send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
        // snx_pool.methods.setRewardDistribution("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3").send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
        // comp_pool.methods.setRewardDistribution("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3").send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
        link_pool.methods.setRewardDistribution("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3").send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
        // ycrv_pool.methods.setRewardDistribution("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3").send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      ]);

    let two_fifty = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(250));
    let one_five = two_fifty.mul(web3.utils.toBN(6));

    console.log("transfering and notifying");
    console.log("transfer");

    // console.log(velo.methods["balanceOf(address)"]);

    //velo.balanceOf = velo.methods["balanceOf(address)"]
    //console.log(velo);
    console.log((await velo.balanceOf("0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3")).toString());
    //console.log(await velo.balanceOf(accounts[0]).call());


    await Promise.all([
      // velo.transfer(VELO_ETHPool.address, two_fifty.toString()),
      // velo.transfer(VELO_uAMPLPool.address, two_fifty.toString()),
      // velo.transfer(VELO_YFIPool.address, two_fifty.toString()),
      // velo.transfer(VELO_LENDPool.address, two_fifty.toString()),
      // velo.transfer(VELO_MKRPool.address, two_fifty.toString()),
      // velo.transfer(VELO_SNXPool.address, two_fifty.toString()),
      // velo.transfer(VELO_COMPPool.address, two_fifty.toString()),
      velo.transfer(VELO_LINKPool.address, two_fifty.toString(), {from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3"}),
      velo.setFeeCharger(feeCharger.address)
      // velo._setIncentivizer(VELOIncentivizer.address),
    ]);

    console.log("notify")
    await Promise.all([
      // eth_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:"0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3"}),
      // ampl_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:"0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3"}),
      // yfi_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:"0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3"}),
      // lend_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:"0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3"}),
      // mkr_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:"0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3"}),
      // snx_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:"0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3"}),
      // comp_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:"0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3"}),
      link_pool.methods.notifyRewardAmount(two_fifty.toString()).send({from:"0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3"}),

      // incentives is a minter and prepopulates itself.
      // ycrv_pool.methods.notifyRewardAmount("0").send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 500000}),
    ]);

    console.log("set reward distribution")
    await Promise.all([
      // eth_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // ampl_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // yfi_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // lend_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // mkr_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // snx_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // comp_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      link_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // ycrv_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
    ]);

    console.log("transfer ownership");
    await Promise.all([
      // eth_pool.methods.transferOwnership(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // ampl_pool.methods.transferOwnership(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // yfi_pool.methods.transferOwnership(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // lend_pool.methods.transferOwnership(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // mkr_pool.methods.transferOwnership(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // snx_pool.methods.transferOwnership(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // comp_pool.methods.transferOwnership(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      link_pool.methods.transferOwnership(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
      // ycrv_pool.methods.transferOwnership(Timelock.address).send({from: "0xD91F9dA1905e6861c6dE4D412EA1788e6eba15E3", gas: 100000}),
    ]);
  }

  await feeCharger.setGov(Timelock.address);

  await Promise.all([
    velo._setPendingGov(Timelock.address),
    // yReserves._setPendingGov(Timelock.address),
    // TODO Set fee charger gov
    yRebaser.setGov(Timelock.address),
  ]);

  await Promise.all([
      tl.executeTransaction(
        VELOProxy.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      // tl.executeTransaction(
      //   VELOReserves.address,
      //   0,
      //   "_acceptGov()",
      //   "0x",
      //   0
      // ),

      // tl.executeTransaction(
      //   VELORebaser.address,
      //   0,
      //   "_acceptGov()",
      //   "0x",
      //   0
      // ),
  ]);
  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await gov.__abdicate();
}
