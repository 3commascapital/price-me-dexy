export type Amount = bigint | null

export type EstimatedAmount = Amount

let amount = $state<Amount>(null)

export const amountStore = {
  get value() {
    return amount
  },
  set value(value: Amount) {
    amount = value
  },
}

let estimatedAmount = $state<Amount>(null)

export const estimatedAmountStore = {
  get value() {
    return estimatedAmount
  },
  set value(value: Amount) {
    estimatedAmount = value
  },
}
