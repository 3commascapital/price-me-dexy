<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte'
  import { stateStore, STATE, modalSelectStore } from '$lib/stores/modal.svelte'
  let id: NodeJS.Timeout | null = null
  let { children } = $props()

  const state = $derived(stateStore.value)
  const closed = $derived(state === STATE.Closed)
  const closing = $derived(state === STATE.Closed || state === STATE.Closing)
  const open = $derived(state === STATE.Open)
  const opening = $derived(state === STATE.Open || state === STATE.Opening)
  $effect(() => {
    if (state === STATE.Opening) {
      setTimeout(() => {
        stateStore.value = STATE.Open
      }, 300)
    } else if (state === STATE.Closing) {
      console.log('closing')
      setTimeout(() => {
        stateStore.value = STATE.Closed
        tick().then(() => {
          modalSelectStore.value = null
        })
      }, 200)
    }
  })
  onDestroy(() => {
    if (id) {
      clearTimeout(id)
    }
  })
</script>

<div
  class="relative z-10"
  class:pointer-events-none={state !== STATE.Open}
  aria-labelledby="modal-title"
  role="dialog"
  aria-modal="true"
>
  <div
    class="fixed inset-0 bg-gray-500/75 transition-opacity"
    class:opacity-0={closed}
    class:ease-out={opening}
    class:duration-300={opening}
    class:opacity-100={open}
    class:ease-in={closing}
    class:duration-200={closing}
    aria-hidden="true"
  ></div>

  <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div
        class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
        class:opacity-0={closing}
        class:translate-y-4={closing}
        class:sm:translate-y-0={closing}
        class:sm:scale-95={closing}
        class:ease-out={opening}
        class:duration-300={opening}
        class:opacity-100={opening}
        class:translate-y-0={opening}
        class:sm:scale-100={opening}
        class:ease-in={closing}
        class:duration-200={closing}
      >
        {@render children()}
      </div>
    </div>
  </div>
</div>
