import { tick } from 'svelte'
import type { FormEventHandler } from 'svelte/elements'

type Modifier = (value: string, focused: boolean) => string

export const createInputSanitizer = (modifier: Modifier, updateTargetWithOutput: boolean = false) => {
  let value = ['', '']
  const onChange: FormEventHandler<HTMLInputElement> = (event) => {
    const target = event.target as HTMLInputElement
    const val = target.value ?? ''
    const focused = document.activeElement === event.target
    value = [val, modifier(val, focused)]
    if (updateTargetWithOutput) {
      tick().then(() => {
        target.value = value[1]
      })
    }
  }
  return {
    get value() {
      return value
    },
    sanitize: modifier,
    onChange,
  }
}

export const numberModifier: Modifier = (value, focused) => {
  const decimalSplits = value.split('.')
  // anything else should be dropped
  const removeNotNumber = /[^\d.]/gim
  let integerPart = decimalSplits[0]
  let decimalPart = decimalSplits[1]
  const hasDecimal = decimalSplits.length > 1
  if (focused) {
    integerPart = integerPart.replace(removeNotNumber, '')
    decimalPart = decimalPart?.replace(removeNotNumber, '') ?? ''
  } else {
    integerPart = addDelimiter(integerPart)
  }
  if (!decimalPart && hasDecimal) {
    decimalPart = focused ? '' : '0'
  }
  const output = decimalPart || hasDecimal ? `${integerPart}.${decimalPart}` : integerPart
  return output
}

export const addDecimalDelimiter = (value: string, delimiter?: string) => {
  const [i, d = ''] = value.split('.')
  if (!d) {
    return addDelimiter(i, delimiter)
  }
  return `${addDelimiter(i, delimiter)}.${d}`
}

export const addDelimiter = (value: string, delimiter: string = ',') => {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, delimiter)
}
