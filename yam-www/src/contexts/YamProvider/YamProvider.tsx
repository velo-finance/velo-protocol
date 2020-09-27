import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Yam } from '../../velo'

export interface YamContext {
  velo?: typeof Yam
}

export const Context = createContext<YamContext>({
  velo: undefined,
})

declare global {
  interface Window {
    velosauce: any
  }
}

const YamProvider: React.FC = ({ children }) => {
  const { ethereum } = useWallet()
  const [velo, setYam] = useState<any>()

  useEffect(() => {
    if (ethereum) {
      const veloLib = new Yam(
        ethereum,
        "1",
        false, {
          defaultAccount: "",
          defaultConfirmations: 1,
          autoGasMultiplier: 1.5,
          testing: false,
          defaultGas: "6000000",
          defaultGasPrice: "1000000000000",
          accounts: [],
          ethereumNodeTimeout: 10000
        }
      )
      setYam(veloLib)
      window.velosauce = veloLib
    }
  }, [ethereum])

  return (
    <Context.Provider value={{ velo }}>
      {children}
    </Context.Provider>
  )
}

export default YamProvider
