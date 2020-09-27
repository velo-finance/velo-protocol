import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'

import { bnToDec, decToBn } from '../utils'
import { getScalingFactor } from '../veloUtils'

import useYam from './useYam'

const useScalingFactor = () => {
  const [scalingFactor, setScalingFactor] = useState(decToBn(1))
  const velo = useYam()

  useEffect(() => {
    async function fetchScalingFactor () {
      const sf = await getScalingFactor(velo)
      setScalingFactor(sf)
    }
    if (velo) {
      fetchScalingFactor()
    }
  }, [velo])

  return bnToDec(scalingFactor)
}

export default useScalingFactor