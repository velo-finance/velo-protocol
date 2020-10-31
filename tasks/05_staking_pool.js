const {deploy_staking_pool} = require("../deploy/staking_pool");

// Deploys the token contract
task("05_staking_pool", "Deploys a VELO staking pool")
  .addParam("label", "a label for this pool")
  .addParam("stakingTokenAddr", "the address of the token to be staked")
  .addParam("startTime", "the stakingpool start (epoch seconds)")
  .addParam("duration", "the duration of the pool (seconds)")
  .addParam("perc", "percentage of total distribution eg. 0.10 = 10% (value between 0-1)")
  .setAction(deploy_staking_pool);

module.exports = {};
