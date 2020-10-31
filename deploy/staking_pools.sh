#!/bin/bash -e

# Example:
#   HARDHAT_NETWORK=hardhat deploy/staking_pools.sh 0 \
#                           0x80fB784B7eD66730e8b1DBd9820aFD29931aab03 \
#                           0xa 0xb 

velo_launch=$1
token_override=$2

[ -z "$HARDHAT_NETWORK" ] && \
  echo "Explicitly define HARDHAT_NETWORK" && \
  exit

days=$((60*60*24))
weeks=$(($days*7));

# deploy_staking_pool
dsp() {
  label=$1
  staking_token=$2
  start_time=$3
  duration=$4
  perc=$5

  if [ -n "$token_override" ]; then
    echo "overriding staking_token"
    staking_token=$token_override
  fi

  npx hardhat --network "$HARDHAT_NETWORK" 05_staking_pool \
  --label $label \
  --staking-token-addr $staking_token  \
  --start-time $start_time --duration $duration --perc $perc
}

reg_query() {
  deploy/registry-query $1
}

# ------------------------------------------- Pool 0 (20%)
start_time=$(($velo_launch + 0))
duration=$((2*$weeks)) 
dsp DAI 0x6B175474E89094C44Da98b954EedeAC495271d0F $start_time $duration 0.10
dsp CRV 0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8 $start_time $duration 0.10

# ------------------------------------------- Pool 1 (4 days) (40%)
start_time=$(( $velo_launch + 4*$days )) 
duration=$((2*$weeks)) 
velo_eth_uni_lp=$(reg_query UniswapV2Pair)
velo_eth_blp=$(reg_query BalancerPool)
dsp VLO_ETH_LP $velo_eth_uni_lp $start_time $duration 0.30
dsp VLO_ETH_BLP $velo_eth_blp $start_time $duration 0.10

# ------------------------------------------- Pool 2 (2 weeks) (24%)
start_time=$(( $velo_launch + 2*$weeks )) 
duration=$((2*$weeks)) 
dsp ETH_DAI_LP 0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11 $start_time $duration 0.06
dsp ETH_USDC_LP 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc $start_time $duration 0.06
dsp ETH_USDT_LP 0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852 $start_time $duration 0.06
dsp ETH_WBTC_LP 0xBb2b8038a1640196FbE3e38816F3e67Cba72D940 $start_time $duration 0.06

# ------------------------------------------- Pool 3 (3 weeks) (16%)
start_time=$(( $velo_launch + 3*$weeks )) 
duration=$((1*$weeks)) 
dsp COMP  0xc00e94Cb662C3520282E6f5717214004A7f26888 $start_time $duration 0.02
dsp AAVE 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9 $start_time $duration 0.02
dsp LINK 0x514910771AF9Ca656af840dff83E8264EcF986CA $start_time $duration 0.02
dsp SNX 0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F $start_time $duration 0.02

dsp SUSHI 0x6B3595068778DD592e39A122f4f5a5cF09C90fE2 $start_time $duration 0.02
dsp PICKLE 0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5 $start_time $duration 0.02
dsp DOUGH 0xad32A8e6220741182940c5aBF610bDE99E737b2D $start_time $duration 0.02
dsp YFI 0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e $start_time $duration 0.02
