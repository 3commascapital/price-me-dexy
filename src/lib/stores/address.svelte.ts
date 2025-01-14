import type { Address } from 'viem'

export type PossibleAddress = Address | null

let from = $state<PossibleAddress>(null)
let to = $state<PossibleAddress>(null)

export const fromStore = {
  get value() {
    return from
  },
  set value(value: PossibleAddress) {
    from = value
  },
}

export const toStore = {
  get value() {
    return to
  },
  set value(value: PossibleAddress) {
    to = value
  },
}
