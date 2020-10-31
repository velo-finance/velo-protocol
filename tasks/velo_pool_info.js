let vinfo = require("./velo_info");

task("velo_pool_info", "Displays info on deployed Pools")
  .setAction(async (taskArgs) => {

    console.log(await vinfo.velo_rebaser_info(hre));

    console.log(await vinfo.velo_feecharger_info(hre));

    console.log(await vinfo.velo_pool_info(hre));

  });
