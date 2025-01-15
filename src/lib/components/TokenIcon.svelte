<script lang="ts">
  import { chainIdStore } from '$lib/stores/chain.svelte'
  import type { Token } from '$lib/stores/token.svelte'
  const { token, size = 'size-6' } = $props<{ token: Token; size?: string }>()
  const icon = $derived(`https://gib.show/image/${chainIdStore.value}/${token.address}`)
</script>

<img src={icon} alt={token.symbol} class={size} />
