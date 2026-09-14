<script lang="ts">
  import { preventDefault } from "svelte/legacy";

  import { addCartItem, isCartUpdating, cart } from "../stores/cart";

  interface Props {
    variantId: string;
    variantQuantityAvailable?: number | null;
    variantAvailableForSale: boolean;
    label?: string;
    appearance?: "default" | "card";
  }

  let {
    variantId,
    variantQuantityAvailable = null,
    variantAvailableForSale,
    label = "Add to Cart",
    appearance = "default",
  }: Props = $props();

  let variantInCart = $derived(
    $cart && $cart.lines?.nodes.filter((item) => item.merchandise.id === variantId)[0]
  );
  let noQuantityLeft = $derived(
    variantQuantityAvailable != null &&
      variantInCart &&
      variantQuantityAvailable <= variantInCart?.quantity
  );

  function addToCart(e: Event) {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const { id, quantity } = Object.fromEntries(formData);
    const item = {
      id: id as string,
      quantity: parseInt(quantity as string),
    };
    addCartItem(item);
  }

  let buttonClass = $derived(
    appearance === "card"
      ? "flex w-full items-center justify-center gap-2 rounded-[10px] bg-forest-700 px-3 py-3 text-sm font-semibold text-white transition hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-60"
      : "button mt-10 w-full"
  );
</script>

<form onsubmit={preventDefault((e) => addToCart(e))}>
  <input type="hidden" name="id" value={variantId} />
  <input type="hidden" name="quantity" value="1" />

  <button
    type="submit"
    class={buttonClass}
    disabled={$isCartUpdating || noQuantityLeft || !variantAvailableForSale}
  >
    {#if $isCartUpdating}
      <svg
        class="mr-1 -ml-1 h-5 w-5 animate-spin text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    {/if}
    {#if variantAvailableForSale}
      {#if appearance === "card"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path>
        </svg>
      {/if}
      {label}
    {:else}
      Sold out
    {/if}
  </button>
  {#if noQuantityLeft}
    <div class="mt-1 text-center text-red-600">
      <small>All units left are in your cart</small>
    </div>
  {/if}
</form>
