<script lang="ts">
  import { amountStore, estimatedAmountStore } from '$lib/stores/amounts.svelte'
  import { createFocusTrap } from '$lib/stores/focus.svelte'
  import { createInputSanitizer, numberModifier } from '$lib/stores/input.svelte'
  import { sideInputStore } from '$lib/stores/side-input.svelte'
  import { outputTokenStore } from '$lib/stores/token.svelte'
  import { parseUnits } from 'viem'
  import TokenIcon from './TokenIcon.svelte'
  import { modalSelectStore, STATE, stateStore } from '$lib/stores/modal.svelte'
  const focused = createFocusTrap()
  const input = createInputSanitizer(numberModifier, true)
  const isAmountInput = $derived(sideInputStore.value === 'out')
  const value = $derived(sideInputStore.value === 'out' ? input.value[1] : estimatedAmountStore.value)
  const selectToken = () => {
    modalSelectStore.value = 'select-token'
    stateStore.value = STATE.Opening
  }
</script>

<div class="flex w-full flex-row">
  <label for="output-token" class="w-full text-sm font-bold">
    <input
      disabled
      placeholder="..."
      type="text"
      {value}
      id="output-token"
      class="w-full overflow-ellipsis rounded-bl-lg border-b-2 border-l-2 border-r-0 border-t-2 border-gray-300 py-2 pl-3 leading-8 focus:outline-none focus:ring-0"
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
        sideInputStore.value = 'out'
        const val = input.value[1]
          ? BigInt(parseUnits(numberModifier(input.value[1], true), outputTokenStore.value.decimals))
          : null
        amountStore.value = val
      }}
      class:border-blue-500={focused.value}
      class:border-gray-300={!focused.value}
    />
  </label>
  <div class="flex flex-col">
    <button
      class="flex rounded-br-lg border-2 border-l-0 border-gray-300 p-2 leading-8"
      class:bg-blue-100={isAmountInput}
      class:border-blue-500={focused.value}
      class:border-gray-300={!focused.value}
      onclick={selectToken}
    >
      <span class="flex min-w-14 items-center justify-end gap-1">
        {outputTokenStore.value.symbol}
        <TokenIcon token={outputTokenStore.value} />
      </span>
    </button>
  </div>
</div>
