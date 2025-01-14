<script lang="ts">
  import { parseUnits } from 'viem'
  import { inputTokenStore } from '$lib/stores/token.svelte'
  import TokenIcon from './TokenIcon.svelte'
  import { createFocusTrap } from '$lib/stores/focus.svelte'
  import { createInputSanitizer, numberModifier } from '$lib/stores/input.svelte'
  import { sideInputStore } from '$lib/stores/side-input.svelte'
  import { amountStore, estimatedAmountStore } from '$lib/stores/amounts.svelte'
  const focused = createFocusTrap()
  const input = createInputSanitizer(numberModifier, true)
  const isAmountInput = $derived(sideInputStore.value === 'in')
  const value = $derived(sideInputStore.value === 'in' ? input.value[1] : estimatedAmountStore.value)
</script>

<div class="flex w-full flex-row">
  <label for="input-token" class="w-full text-sm font-bold">
    <input
      type="text"
      {value}
      id="input-token"
      class="w-full overflow-ellipsis rounded-tl-lg border-b-2 border-l-2 border-r-0 border-t-2 p-2 py-2 pl-3 leading-8 focus:outline-none focus:ring-0"
      onfocus={(e) => {
        focused.onFocus()
        input.onChange(e)
      }}
      onblur={(e) => {
        focused.onBlur()
        input.onChange(e)
      }}
      oninput={(e) => {
        input.onChange(e)
        sideInputStore.value = 'in'
        const val = input.value[1]
          ? BigInt(parseUnits(numberModifier(input.value[1], true), inputTokenStore.value.decimals))
          : null
        amountStore.value = val
      }}
      class:outline-left-4={focused.value}
      class:border-gray-300={!focused.value}
      class:border-blue-500={focused.value}
    />
  </label>
  <div class="flex flex-col">
    <button
      class="rounded-tr-lg border-2 border-l-0 p-2 leading-8"
      class:bg-blue-100={isAmountInput}
      class:border-gray-300={!focused.value}
      class:border-blue-500={focused.value}
    >
      <span class="flex min-w-14 items-center justify-end gap-1">
        {inputTokenStore.value.symbol}
        <TokenIcon token={inputTokenStore.value} />
      </span>
    </button>
  </div>
</div>
