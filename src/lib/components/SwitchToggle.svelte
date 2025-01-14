<script lang="ts">
  import { inputTokenStore, outputTokenStore } from '$lib/stores/token.svelte'
  const onClick = () => {
    const $inputToken = inputTokenStore.value
    const $outputToken = outputTokenStore.value
    inputTokenStore.value = $outputToken
    outputTokenStore.value = $inputToken
  }
</script>

<button
  aria-label="Switch Tokens"
  class="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-500 text-white"
  on:click={onClick}
>
  <span
    class="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b-4 border-r-4 border-white"
  ></span>
</button>
