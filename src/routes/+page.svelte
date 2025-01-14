<script lang="ts">
  import SwitchToggle from '$lib/components/SwitchToggle.svelte'
  import InputToken from '$lib/components/InputToken.svelte'
  import OutputToken from '$lib/components/OutputToken.svelte'
  import BlockReadout from '$lib/components/BlockReadout.svelte'
  import Compare from '$lib/components/Compare.svelte'
  import Connect from '$lib/components/Connect.svelte'
</script>

<main class="flex h-screen flex-col items-center pt-16">
  <div class="absolute right-0 top-0 m-2 rounded-lg bg-blue-100">
    <BlockReadout />
  </div>
  <div class="flex w-full max-w-96 flex-col gap-2">
    <h1 class="w-full text-center text-4xl font-bold">Price Me, Baby</h1>
    <div class="relative flex w-full flex-row gap-2 px-2 pt-2">
      <div class="flex w-full flex-col gap-2">
        <div class="flex flex-row">
          <InputToken />
        </div>
        <SwitchToggle />
        <div class="flex flex-row">
          <OutputToken />
        </div>
      </div>
    </div>
    <div class="flex w-full flex-row justify-center px-2 pb-2">
      <Connect />
    </div>
  </div>
  <Compare />
</main>
