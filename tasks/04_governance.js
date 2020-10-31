const {deploy_governance} = require("../deploy/governance");

// Deploys the token contract
task("04_deploy_governance", "Deploys the governance system")
  .setAction(deploy_governance);

module.exports = {};
