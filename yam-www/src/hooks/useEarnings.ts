import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { Contract } from "web3-eth-contract"

import { getEarned } from '../veloUtils'
import useYam from './useYam'

const useEarnings = (pool: Contract) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account }: { account: string } = useWallet()
  const velo = useYam()

  const fetchBalance = useCallback(async () => {
    const balance = await getEarned(velo, pool, account)
    setBalance(new BigNumber(balance))
  }, [account, pool, velo])

  useEffect(() => {
    if (account && pool && velo) {
      fetchBalance()
    }
  }, [account, pool, setBalance, velo])

  return balance
}

export default useEarnings