const {constants, expectRevert, time} = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const {BN18f, getCurrentBlock, mineBlocks} = require('./utils');

const {deploy_token} = require('../deploy/token');
const {deploy_uniswap_pool} = require("../deploy/uniswap_pool");
const {deploy_balancer_pool} = require("../deploy/balancer_pool");
const {deploy_governance} = require("../deploy/governance");
const {deploy_staking_pool} = require("../deploy/staking_pool");
const {deploy_fund_staking_pools} = require("../deploy/fund_staking_pools");
const {deploy_apply_gov} = require("../deploy/apply_gov");
const {logger} = require('ethers');
const {loadFixture} = require('ethereum-waffle');
const {deploy} = require('../deploy/utils');

async function deploy_all() {
  await deploy_token({rebaseInterval: 0, rebaseStart: 0});

  // do not need the pools for these tests.
  await deploy_uniswap_pool({ethPrice: 400});
  await deploy_balancer_pool({ethPrice: 400});
  // await deploy_governance();
  //
  // deploy_staking_pool
  // deploy_fund_staking_pools
  // await deploy_apply_gov();
}



describe("Deployment", function() {
  before("deploy system", async () => {
    await deploy_all();
  });



  it('calls the methods on the pool', async () => {
    const reg = require("../deploy/registry")(hre);

    let vToken = await reg.getContract("VELODelegator");
    let vRebaser = await reg.getContract("VELORebaser");

    vRebaser.rebase();

  }).timeout(0);
});

