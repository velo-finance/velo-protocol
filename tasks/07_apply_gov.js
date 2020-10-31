const {deploy_apply_gov} = require("../deploy/apply_gov");

// Deploys the token contract
task("07_apply_gov", "Applies governance to all aspects")
  .setAction(deploy_apply_gov);

