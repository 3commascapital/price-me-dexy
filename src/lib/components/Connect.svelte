<script lang="ts">
  import { fromStore } from '$lib/stores/address.svelte'
  import type { Hex } from 'viem'
  const connect = () => {
    window.ethereum.request({ method: 'eth_requestAccounts' }).then((accounts) => {
      fromStore.value = (accounts[0] as Hex) || null
    })
  }
  const from = $derived(fromStore.value)
</script>

<span class="relative h-12 w-full text-lg text-white">
  {#if from}
    <span
      class="flex w-full items-center justify-center rounded-lg p-2 text-center"
      class:bg-blue-500={!from}
      class:bg-blue-100={!!from}
      class:text-gray-800={!!from}
      class:border-gray-300={!!from}
      class:border-2={!!from}>Connected</span
    ><button
      class="absolute right-0 top-0 flex size-12 h-full content-end items-center justify-center rounded-r-lg bg-blue-500 p-2 text-2xl text-white"
      onclick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        fromStore.value = null
      }}>&times;</button
    >
  {:else}
    <button
      class="flex h-12 w-full items-center justify-center rounded-lg p-2"
      class:bg-blue-500={!from}
      class:bg-blue-300={!!from}
      onclick={connect}>Connect</button
    >
  {/if}
</span>
