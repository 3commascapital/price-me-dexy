import type { MinimalBlock } from './stores/block.svelte'
import { addDelimiter } from './stores/input.svelte'

export const readableDate = (block: MinimalBlock) => {
  const tsmp = block?.timestamp ?? 0
  const ms = Number(tsmp) * 1000
  const d = new Date(ms)
  const [, time] = d.toISOString().split('Z')[0].split('T')
  return time.slice(0, time.length - 4)
}

// place files you want to import through the `$lib` alias in this folder.
export const blockInfo = (block: MinimalBlock) => {
  return `#${addDelimiter(`${block?.number ?? '0'}`, '_')}@${readableDate(block)}`
}
