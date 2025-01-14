import { pulsechain } from 'viem/chains'

let rpcUrls = $state({
  [pulsechain.id]: ['https://rpc-pulsechain.g4mm4.io'],
})

export const rpcUrlsStore = {
  get value() {
    return rpcUrls
  },
  set value(value: typeof rpcUrls) {
    rpcUrls = value
  },
}
