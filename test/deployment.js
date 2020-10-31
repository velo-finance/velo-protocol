const {deploy_token} = require('../deploy/token');
const {deploy_uniswap_pool} = require("../deploy/uniswap_pool");
const {deploy_balancer_pool} = require("../deploy/balancer_pool");
const {deploy_governance} = require("../deploy/governance");
const {deploy_staking_pool} = require("../deploy/staking_pool");
const {deploy_fund_staking_pools} = require("../deploy/fund_staking_pools");
const {deploy_apply_gov} = require("../deploy/apply_gov");

async function deploy_all() {
  await deploy_token({rebaseInterval: 0, rebaseStart: 0});
  await deploy_uniswap_pool({ethPrice: 400});
  await deploy_balancer_pool({ethPrice: 400});
  await deploy_governance();

  // deploy_staking_pool
  // deploy_fund_staking_pools

  await deploy_apply_gov();
}

describe("Deployment", () => {
  it("does a complete deployment", async () => {
    await deploy_all();
  });
}
);

