import { useContext } from 'react'
import { Context } from '../contexts/YamProvider'

const useYam = () => {
  const { velo } = useContext(Context)
  return velo
}

export default useYam