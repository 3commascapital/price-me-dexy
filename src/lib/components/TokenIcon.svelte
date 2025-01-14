<script lang="ts">
  import { chainIdStore } from '$lib/stores/chain.svelte'
  import type { Token } from '$lib/stores/token.svelte'
  const { token } = $props<{ token: Token }>()
  const icon = $derived(`https://gib.show/image/${chainIdStore.value}/${token.address}`)
</script>

<img src={icon} alt={token.symbol} class="size-6" />
