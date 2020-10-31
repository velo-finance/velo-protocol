const {deploy_uniswap_pool} = require("../deploy/uniswap_pool");

// Deploys the token contract
task("02_deploy_uniswap_pool", "Deploys the uniswap pool")
  // .addParam("veloTokenAddr", "The deployed velo token address")
  .addParam("ethPrice", "The current ethereum price, eg 420.65")
  .setAction(deploy_uniswap_pool);

