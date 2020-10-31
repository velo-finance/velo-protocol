const UniswapV2FactoryBytecode = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const UniswapV2Router02Bytecode = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const TruffleContract = require('@truffle/contract');

const {deploy_Token, deploy_WETH9} = require("./utils");

// some helpers
let to_bn = (v) => web3.utils.toWei(web3.utils.toBN(v))
let to_bn_s = (v) => to_bn(v).toString()

// Deploys the token contract

function has_uniswap() {
  return ( hre.network.name == "mainnet" || hre.network.name == "kovan" )
}

async function deploy_uniswap(owner, weth_token) {
  let UniswapV2Factory = TruffleContract(UniswapV2FactoryBytecode);
  let UniswapV2Router02 = TruffleContract(UniswapV2Router02Bytecode);
  UniswapV2Factory.setProvider(web3.currentProvider);
  UniswapV2Router02.setProvider(web3.currentProvider);
  let uniswapV2Factory = await UniswapV2Factory.new(owner.address);
  let uniswapV2Router = await UniswapV2Router02.new(uniswapV2Factory.address, weth_token.address);

  // console.log("Deployed UniSwap Router & Factory @ {%s,%s}", uniswapV2Router.address, uniswapV2Factory.address);

  return [uniswapV2Router, uniswapV2Factory];
}

// Deploys the token contract
async function deploy_uniswap_pool(taskArgs) {
  const hre = require("hardhat");
  const reg = require("./registry")(hre);

  let [deployer] = await ethers.getSigners();

  let UniRouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

  // deploy uniswap if not available so we can test this locally
  if ( !has_uniswap() ) {
    let weth_token = await deploy_WETH9();
    let [uniV2Router,] = await deploy_uniswap(deployer, weth_token);
    UniRouterAddress = uniV2Router.address;
  }

  // Intitialize the Router
  let UniV2Router02Artifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
  let UniRouter02 = new web3.eth.Contract(UniV2Router02Artifact.abi, UniRouterAddress);

  // Approve the UniRouter to spend our VELO
  // let veloToken = await ethers.getContractAt('VELODelegator', taskArgs.veloTokenAddr);
  let veloToken;
  // when testing deployment we do not care about the actual
  // VLO token
  if(hre.network.name == "hardhat") {
    veloToken = await deploy_Token("VLO");
  } else {
    // Approve the BPool to spend our VELO
    veloToken = await reg.getContract('VELODelegator');
  }

  console.log("    ... approving Univ2Router to spend VELO");
  await veloToken.approve(UniRouterAddress, web3.utils.toWei('1'));

  // parse ethPrice to determine one_cent_in_eth
  let ethPrice = parseFloat(taskArgs.ethPrice);
  let one_cent_in_eth = web3.utils.toWei((1/ethPrice).toString().substring(0,20));

  // provide some liquidity to create the UniswapV2Pair
  console.log("    ... addLiquidityETH");
  let r = await UniRouter02.methods
    .addLiquidityETH(
      veloToken.address,
      to_bn_s(1),
      to_bn_s(1),
      one_cent_in_eth,
      deployer.address,
      parseInt(Date.now() / 1000) + 60)
    .send({from: deployer.address, value: one_cent_in_eth}); 

  let uniV2PairAddr = r.events[4].address;

  // Log the pair
  await reg.store("UniswapV2Pair", uniV2PairAddr);
  console.log("Created UniSwap Pair @ %s", uniV2PairAddr);

  // Now register this UniswapV2Pair to sync
  if(hre.network.name == "hardhat") {
    console.log("    .. skipping tx to _afterRebase at hardhat");
  } else {
    let rebaser = await reg.getContract('VELORebaser');
    await rebaser.addTransaction(uniV2PairAddr, '0xfff6cae9');
    console.log("    .. added tx to _afterRebase");
  }
}

module.exports = {deploy_uniswap_pool};
