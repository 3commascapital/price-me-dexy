let chainId = $state(369)
export const chainIdStore = {
  get value() {
    return chainId
  },
  set value(value: number) {
    chainId = value
  },
}
