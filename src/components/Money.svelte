<script lang="ts">
  import type { z } from "zod";
  import type { MoneyV2Result } from "../utils/schemas";

  interface Props {
    price?: z.infer<typeof MoneyV2Result> | null;
    showCurrency?: boolean;
  }

  let { price, showCurrency = false }: Props = $props();

  let formatPrice = $derived.by(() => {
    if (!price) return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currencyCode,
      currencyDisplay: showCurrency ? "symbol" : "narrowSymbol",
    }).format(parseFloat(price.amount));
  });
</script>

{#if price}
  <span>
    {formatPrice}
  </span>
{/if}
