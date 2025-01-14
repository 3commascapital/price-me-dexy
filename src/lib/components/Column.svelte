<script lang="ts">
  import { addDecimalDelimiter } from '$lib/stores/input.svelte'
  import type { Entry } from '$lib/stores/tracers/index.svelte'

  export let key: string
  export let cells: Entry[]
  export let noDelimiter: boolean = false
  export let size = 'md'
</script>

<div class="flex w-full flex-col">
  <div class="flex text-right font-mono">{key}</div>
  {#each cells as cell}
    <div
      class="flex overflow-hidden text-ellipsis text-right font-mono"
      class:max-w-48={size === 'md'}
      class:max-w-64={size === 'lg'}
    >
      {#if cell.error}
        <span class="overflow-hidden text-ellipsis whitespace-nowrap">Error</span>
      {:else if cell.loading}
        <span class="overflow-hidden text-ellipsis whitespace-nowrap">Loading...</span>
      {:else}
        <span class="overflow-hidden text-ellipsis whitespace-nowrap"
          >{noDelimiter ? cell.value : addDecimalDelimiter(cell.value)}</span
        >{cell.symbol}
      {/if}
    </div>
  {/each}
</div>
