<script lang="ts">
  import { addDecimalDelimiter } from '$lib/stores/input.svelte'
  import type { Entry } from '$lib/stores/tracers/index.svelte'

  export let key: string
  export let cells: Entry[]
  export let noDelimiter: boolean = false
  export let size = 'md'
</script>

<div class="flex w-full flex-col">
  <div class="flex px-2 text-right font-mono font-bold">{key}</div>
  {#each cells as cell}
    <div class="flex overflow-hidden text-ellipsis border-t text-right font-mono">
      {#if cell.error}
        <span class="overflow-hidden text-ellipsis whitespace-pre px-2 italic">Error{'\n '}</span>
      {:else if cell.loading}
        <span class="overflow-hidden text-ellipsis whitespace-pre px-2 italic">Loading...{'\n '} </span>
      {:else}
        {@const cellData = noDelimiter
          ? `${cell.value}\n `
          : ` ${addDecimalDelimiter(cell.value)}\n/${addDecimalDelimiter(cell.minOut)}`}
        <span
          class="overflow-hidden text-ellipsis whitespace-pre px-2 text-left"
          class:max-w-48={size === 'md'}
          class:max-w-64={size === 'lg'}
          title={cellData}>{cellData}</span
        >{cell.symbol}
      {/if}
    </div>
  {/each}
</div>
