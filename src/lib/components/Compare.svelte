<script lang="ts">
  import Column from './Column.svelte'
  import { amountStore } from '$lib/stores/amounts.svelte'
  import { blocksStore, clientStore } from '$lib/stores/block.svelte'
  import { inputTokenStore, outputTokenStore } from '$lib/stores/token.svelte'
  import { fromStore, toStore } from '$lib/stores/address.svelte'
  import { entriesByColumn, getQuotes, type Entry } from '$lib/stores/tracers/index.svelte'
  import { type PublicClient } from 'viem'
  import _ from 'lodash'
  import { blockInfo } from '$lib'

  const client = $derived.by(() => clientStore.value)
  const block = $derived.by(() => blocksStore.value.latest)
  const inputToken = $derived.by(() => inputTokenStore.value)
  const outputToken = $derived.by(() => outputTokenStore.value)
  const amount = $derived.by(() => amountStore.value)
  const from = $derived.by(() => fromStore.value)
  const to = $derived.by(() => toStore.value || fromStore.value)

  $effect(() => {
    let cancelled = false
    getQuotes(
      {
        client: client as PublicClient,
        block,
        inputToken,
        outputToken,
        amount,
        from,
        to,
        allowedSlippage: 0.5, // %
      },
      () => cancelled,
    )
    return () => {
      cancelled = true
    }
  })
  const cols = $derived(Object.entries(entriesByColumn)[0][1])
  const blockCells = $derived(
    cols.map((cell) => ({
      loading: false,
      value: blockInfo(cell.block),
      symbol: '',
      error: null,
      id: '',
      column: 0,
    })) as unknown as Entry[],
  )
</script>

<div class="flex w-full flex-col gap-4 p-2">
  <h1 class="text-center text-2xl">Compare</h1>
  {#if cols.length > 0}
    <div class="flex w-full flex-row">
      {#each Object.entries(entriesByColumn) as [key, cells], i}
        {#if i === 0}
          <Column key="block" cells={blockCells} noDelimiter size="lg" />
        {/if}
        <Column {key} {cells} />
      {/each}
    </div>
  {/if}
</div>
