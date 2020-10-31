const {deploy_balancer_pool} = require("../deploy/balancer_pool");

// Deploys the token contract
task("03_deploy_balancer_pool", "Deploys the balancer pool")
  .addParam("ethPrice", "The current ethereum price, eg 420.65")
  .setAction(deploy_balancer_pool);

