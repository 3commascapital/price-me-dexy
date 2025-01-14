<script lang="ts">
  import { fromStore } from '$lib/stores/address.svelte'
  import type { Hex } from 'viem'
  const connect = () => {
    window.ethereum.request({ method: 'eth_requestAccounts' }).then((accounts) => {
      fromStore.value = (accounts[0] as Hex) || null
    })
  }
</script>

<button
  class="w-full rounded-md p-2 text-lg text-white"
  class:bg-blue-500={!fromStore.value}
  class:bg-blue-300={!!fromStore.value}
  on:click={connect}
>
  {#if fromStore.value}
    Connected
  {:else}
    Connect
  {/if}
</button>
