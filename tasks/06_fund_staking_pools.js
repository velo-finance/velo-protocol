const {deploy_fund_staking_pools} = require("../deploy/fund_staking_pools");

task("06_fund_staking_pools", "Fund staking pools and calls notifyRewardAmount")
  .setAction(deploy_fund_staking_pools);

module.exports = {};
