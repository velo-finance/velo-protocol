import { Yam } from '../../velo'

import { bnToDec } from '../../utils'

import {
  getCurrentPrice as gCP,
  getTargetPrice as gTP,
  getCirculatingSupply as gCS,
  getNextRebaseTimestamp as gNRT,
  getTotalSupply as gTS,
  getScalingFactor,
} from '../../veloUtils'

const getCurrentPrice = async (velo: typeof Yam): Promise<number> => {
  // FORBROCK: get current VELO price
  return gCP(velo)
}

const getTargetPrice = async (velo: typeof Yam): Promise<number> => {
  // FORBROCK: get target VELO price
  return gTP(velo)
}

const getCirculatingSupply = async (velo: typeof Yam): Promise<string> => {
  // FORBROCK: get circulating supply
  return gCS(velo)
}

const getNextRebaseTimestamp = async (velo: typeof Yam): Promise<number> => {
  // FORBROCK: get next rebase timestamp
  const nextRebase = await gNRT(velo) as number
  return nextRebase * 1000
}

const getTotalSupply = async (velo: typeof Yam): Promise<string> => {
  // FORBROCK: get total supply
  return gTS(velo)
}

export const getStats = async (velo: typeof Yam) => {
  const curPrice = await getCurrentPrice(velo)
  const circSupply = '' // await getCirculatingSupply(velo)
  const nextRebase = await getNextRebaseTimestamp(velo)
  const rawScalingFactor = await getScalingFactor(velo)
  const scalingFactor = Number(bnToDec(rawScalingFactor).toFixed(2))
  const targetPrice = await getTargetPrice(velo)
  const totalSupply = await getTotalSupply(velo)
  return {
    circSupply,
    curPrice,
    nextRebase,
    scalingFactor,
    targetPrice,
    totalSupply
  }
}
