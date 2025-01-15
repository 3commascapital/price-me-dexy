<script lang="ts">
  import { STATE, stateStore, listFetch } from '$lib/stores/modal.svelte'
  import { defaultInputToken, defaultOutputToken, outputTokenStore, type Token } from '$lib/stores/token.svelte'
  import { getAddress, isAddress } from 'viem'
  import TokenIcon from './TokenIcon.svelte'
  const close = () => {
    stateStore.value = STATE.Closing
  }
  const select = (token: Token) => {
    outputTokenStore.value = token
    close()
  }
  let search = $state('')
  let allTokens = $state<Token[]>([defaultInputToken, defaultOutputToken])
  const tokens = $derived.by(() => {
    const lower = search.toLowerCase()
    return search
      ? isAddress(search)
        ? allTokens.filter((token) => getAddress(token.address) === getAddress(search))
        : allTokens.filter(
            (token) => token.name.toLowerCase().includes(lower) || token.symbol.toLowerCase().includes(lower),
          )
      : allTokens
  })
  $effect(() => {
    listFetch.then((tkns) => {
      allTokens = tkns
    })
  })
</script>

<div class="bg-white">
  <div class="flex flex-col bg-white px-4 pb-4 pt-4">
    <div class="flex w-full flex-row items-center justify-between text-center sm:text-left">
      <input type="text" placeholder="Select Token or Search" class="mr-4 w-full px-2 py-1" bind:value={search} />
      <button
        type="button"
        class="flex size-10 min-w-10 justify-center rounded-full bg-red-600 text-sm font-semibold leading-10 text-white shadow-sm hover:bg-red-500"
        onclick={close}>&times;</button
      >
    </div>
  </div>
  <div class="flex max-h-60 w-full flex-col overflow-y-scroll">
    <div class="flex flex-col px-4">
      {#each tokens as token}
        <button class="flex w-full items-center py-1" onclick={() => select(token)}>
          <TokenIcon {token} size={8} />
          <span>&nbsp;{token.symbol}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
