#!/bin/bash -xe

start_time=$1
eth_price=$2
token_override=$3

[ -z "$HARDHAT_NETWORK" ] && \
  echo "Explicitly define HARDHAT_NETWORK" && \
  exit

twelve_hours=43200
rebase_delay=2419200

npx hardhat 01_deploy_token --rebase-interval $twelve_hours --rebase-start $(( $start_time + $rebase_delay ))
npx hardhat 02_deploy_uniswap_pool --eth-price $eth_price
npx hardhat 03_deploy_balancer_pool --eth-price $eth_price
npx hardhat 04_deploy_governance
deploy/staking_pools.sh $start_time $token_override

npx hardhat 06_fund_staking_pools

npx hardhat 07_apply_gov


