import _ from 'lodash'
import type { Token } from './token.svelte'

export const STATE = {
  Closed: 'Closed',
  Opening: 'Opening',
  Open: 'Open',
  Closing: 'Closing',
} as const

export type State = (typeof STATE)[keyof typeof STATE]

let state = $state<State>(STATE.Closed)

export const stateStore = {
  get value() {
    return state
  },
  set value(value: State) {
    state = value
  },
}

let modalSelect = $state<string | null>(null)

export const modalSelectStore = {
  get value() {
    return modalSelect
  },
  set value(value: string | null) {
    modalSelect = value
  },
}

export const listFetch = Promise.all([
  fetch(`https://gib.show/list/piteas`), // piteas
  fetch(`https://gib.show/list/9mm`), // 9mm
])
  .then((res) => Promise.all(res.map((r) => r.json() as Promise<{ tokens: Token[] }>)))
  .then((res) =>
    _(res)
      .flatMap((r) => r.tokens)
      .uniqBy((t) => `${t.address}-${t.chainId}`)
      .sortBy((a) => a.symbol.toLowerCase())
      .value(),
  )
