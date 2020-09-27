import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from "web3-eth-contract"

import { getStaked } from '../veloUtils'
import useYam from './useYam'

const useStakedBalance = (pool: Contract) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const velo = useYam()

  const fetchBalance = useCallback(async () => {
    const balance = await getStaked(velo, pool, account)
    setBalance(new BigNumber(balance))
  }, [account, pool, velo])

  useEffect(() => {
    if (account && pool && velo) {
      fetchBalance()
    }
  }, [account, pool, setBalance, velo])

  return balance
}

export default useStakedBalance