const {deploy_token} = require('../deploy/token');

// Deploys the token contract
task("01_deploy_token", "Deploys the VELO token")
  .addParam("rebaseStart", "unix timestamp when enable the rebase")
  .addParam("rebaseInterval", "interval between rebases in seconds")
  .setAction(deploy_token);

module.exports = {};
