<script lang="ts">
  import { onMount } from "svelte";
  import { initCart, cart, isCartDrawerOpen } from "../stores/cart";

  onMount(() => {
    initCart();
  });

  function openCart() {
    isCartDrawerOpen.set(true);
  }
</script>

<button
  type="button"
  class="relative grid h-10 w-10 place-items-center rounded-[10px] bg-gray-100 text-gray-800 transition hover:bg-forest-100"
  onclick={() => openCart()}
>
  <span class="sr-only">Open your cart</span>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
  </svg>
  <span
    class="absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold-500 px-0.5 text-[0.65rem] font-bold text-gray-900"
  >
    {$cart?.totalQuantity ?? 0}
  </span>
</button>
