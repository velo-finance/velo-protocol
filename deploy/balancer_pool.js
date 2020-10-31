const {deploy_Token, deploy_WETH9} = require("./utils");

// some helpers
let to_bn = (v) => web3.utils.toWei(web3.utils.toBN(v))
let to_bn_s = (v) => to_bn(v).toString()

async function deploy_balancer(deployer) {
  let bFactoryByteCode = require("./balancerFactoryBytecode");

  const tx = await deployer.sendTransaction({data: bFactoryByteCode});
  return tx.creates;
}

// Deploys the token contract
async function deploy_balancer_pool(taskArgs) {
  const hre = require("hardhat");
  const reg = require("./registry")(hre);

  let [deployer] = await ethers.getSigners();

  let BFactoryAddr;

  // Determine BFactory address based on the network we are deploying
  let factory;
  switch(hre.network.name) {
    case "mainnet":
      BFactoryAddr = '0x9424B1412450D0f8Fc2255FAf6046b98213B76Bd';
      break;
    case "kovan":
      BFactoryAddr = '0x8f7F78080219d4066A8036ccD30D588B416a40DB';
      break;
    case "hardhat":
      BFactoryAddr = await deploy_balancer(deployer);
      break;
    case "test":
      BFactoryAddr = await deploy_balancer(deployer);
      break;
    default:
      throw "unknown network";
  };

  // Get the ABI
  let BFactory = require('../artifacts/contracts/test/BFactory.sol/BFactory.json');

  // We need to go the web3 way as we need access to the events
  let bfactory = new web3.eth.Contract(BFactory.abi, BFactoryAddr);
  let r = await bfactory.methods.newBPool().send({from: deployer.address})
  let bPoolAddr = r.events[0].address;


  await reg.store("BalancerPool", r.events[0].address);
  console.log("VELO/ETHER Balancer Pool: %s", bPoolAddr);

  let bPool = await ethers.getContractAt('BPool', bPoolAddr)

  // parse ethPrice to determine one_cent_in_eth
  let ethPrice = parseFloat(taskArgs.ethPrice);
  let one_cent_in_eth = web3.utils.toWei((1/ethPrice).toString().substring(0,20));

  let veloToken;
  // when testing deployment we do not care about the actual
  // VLO token
  if(hre.network.name == "hardhat") {
    veloToken = await deploy_Token("VLO");
  } else {
    // Approve the BPool to spend our VELO
    veloToken = await reg.getContract('VELODelegator');
  }

  // approve bPool to spend our 
  console.log("    ... approving bPool to spend VLO");
  await veloToken.approve(bPool.address, web3.utils.toWei('49'));

  // get wETH
  let wETH;
  switch(hre.network.name) {
    case "mainnet":
      wETH = await ethers.getContractAt('WETH9', "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
      break;
    case "kovan":
      wETH = await ethers.getContractAt('WETH9', "0xd0A1E359811322d97991E03f863a0C30C2cF029C");
      break;
    case "hardhat":
      wETH = await deploy_WETH9();
      break;
    case "test":
      wETH = await deploy_WETH9();
      break;
    default:
      throw "unknown network";
  };

  // now lets create some wETH, and approve
  console.log("    ... converting some ETH into wETH");
  await web3.eth.sendTransaction(
    {
      to: wETH.address,
      from: deployer.address,
      value: one_cent_in_eth
    });

  console.log("    ... approving bPool to spend wETH");
  await wETH.approve(bPool.address, one_cent_in_eth)

  // Now bind the wETH and VELO to the pool
  console.log("    ... binding wETH");
  await bPool.bind(
    wETH.address,
    one_cent_in_eth,
    web3.utils.toWei('1'),
  );

  console.log("    ... binding VLO");
  await bPool.bind(
    veloToken.address,
    web3.utils.toWei('49'),
    web3.utils.toWei('49')
  );

  console.log("    ... setting swap fee");
  await bPool.setSwapFee(web3.utils.toWei("0.003"));


  console.log("    ... finalizing");
  await bPool.finalize();

  // Now register this UniswapV2Pair to sync
  if(hre.network.name == "hardhat") {
    console.log("    ... skipping tx to _afterRebase at hardhat");
  } else {
    let rebaser = await reg.getContract('VELORebaser');


    let BPool = require('../artifacts/contracts/test/BPool.sol/BPool.json');
    let bpool = new web3.eth.Contract(BPool.abi, bPool.address);
    let tx_data = bpool.methods.gulp(veloToken.address).encodeABI()

    console.log("    .. tx_data: %s", tx_data);

    await rebaser.addTransaction(bPool.address, tx_data);
    console.log("    .. added tx_data to _afterRebase");
  }

};

module.exports = {deploy_balancer_pool};
