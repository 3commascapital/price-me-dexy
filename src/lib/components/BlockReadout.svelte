<script lang="ts">
  import { blocksStore, intervalDistanceStore, type MinimalBlock } from '$lib/stores/block.svelte'
  import { createClient } from '$lib/stores/client.svelte'
  import { rpcUrlsStore } from '$lib/stores/rpc.svelte'
  import { chainIdStore } from '$lib/stores/chain.svelte'
  import { addDelimiter } from '$lib/stores/input.svelte'
  import { blockInfo } from '$lib'

  const client = $derived.by(() => {
    const chainId = chainIdStore.value
    const cId = chainId as keyof typeof rpcUrlsStore.value
    const client = createClient(chainId, rpcUrlsStore.value[cId])
    return client
  })
  $effect(() =>
    client.watchBlocks({
      blockTag: 'latest',
      emitOnBegin: true,
      pollingInterval: intervalDistanceStore.value,
      onBlock: (block) => {
        // if (blocksStore.value.latest) {
        //   if (block.number % 3n !== 0n) {
        //     return
        //   }
        // }
        blocksStore.value = {
          ...blocksStore.value,
          latest: block as unknown as MinimalBlock,
        }
      },
    }),
  )
</script>

<span class="flex rounded-lg border border-gray-300 px-2 py-1 font-mono text-xs">
  {blocksStore.value.latest ? blockInfo(blocksStore.value.latest) : ''}
</span>
