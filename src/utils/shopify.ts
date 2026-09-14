import { z } from "zod";
import { CartResult, ProductResult } from "./schemas";
import { config } from "./config";
import {
  ProductsQuery,
  ProductByHandleQuery,
  CreateCartMutation,
  AddCartLinesMutation,
  GetCartQuery,
  RemoveCartLinesMutation,
  ProductRecommendationsQuery,
  AllProductsQuery,
} from "./graphql";
import {
  catalogCategories,
  categorySlugForType,
  type CatalogSlug,
} from "../config/catalog";

// Make a request to Shopify's GraphQL API  and return the data object from the response body as JSON data.
const makeShopifyRequest = async (
  query: string,
  variables: Record<string, unknown> = {},
  buyerIP: string = ""
) => {
  const isSSR = import.meta.env.SSR;
  const apiUrl = `https://${config.shopifyShop}/api/${config.apiVersion}/graphql.json`;

  function getOptions() {
    // If the request is made from the server, we need to pass the private access token and the buyer IP
    isSSR &&
      !buyerIP &&
      console.error(
        `🔴 No buyer IP provided => make sure to pass the buyer IP when making a server side Shopify request.`
      );

    const { privateShopifyAccessToken, publicShopifyAccessToken } = config;
    const options = {
      method: "POST",
      headers: {},
      body: JSON.stringify({ query, variables }),
    };
    // Check if the Shopify request is made from the server or the client
    if (isSSR) {
      options.headers = {
        "Content-Type": "application/json",
        "Shopify-Storefront-Private-Token": privateShopifyAccessToken,
        "Shopify-Storefront-Buyer-IP": buyerIP,
      };
      return options;
    }
    options.headers = {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": publicShopifyAccessToken,
    };

    return options;
  }

  const response = await fetch(apiUrl, getOptions());

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${body}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: Error) => e.message).join("\n"));
  }

  return json.data;
};

// Get all products or a limited number of products (default: 10)
export const getProducts = async (options: {
  limit?: number;
  buyerIP: string;
}) => {
  const { limit = 10, buyerIP } = options;

  try {
    const data = await makeShopifyRequest(
      ProductsQuery,
      { first: limit },
      buyerIP
    );
    const { products } = data;

    if (!products?.edges) {
      return [];
    }

    const productsList = products.edges.map((edge: any) => edge.node);
    const ProductsResult = z.array(ProductResult);
    return ProductsResult.parse(productsList);
  } catch (error) {
    console.error("Shopify getProducts failed:", error);
    return [];
  }
};

type ListedProduct = NonNullable<z.infer<typeof ProductResult>>;

let catalogCache: { expires: number; products: ListedProduct[] } | null = null;
const CATALOG_TTL_MS = 60_000;

export const getAllProducts = async (options: { buyerIP: string }) => {
  const { buyerIP } = options;
  if (catalogCache && catalogCache.expires > Date.now()) {
    return catalogCache.products;
  }

  const ProductsList = z.array(ProductResult);
  const collected: ListedProduct[] = [];
  let after: string | null = null;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const data = await makeShopifyRequest(
        AllProductsQuery,
        { first: 100, after },
        buyerIP
      );
      const connection = data.products;
      if (!connection?.edges) break;

      const page = ProductsList.parse(
        connection.edges.map((edge: { node: unknown }) => edge.node)
      ).filter((product): product is ListedProduct => Boolean(product));
      collected.push(...page);

      hasNextPage = Boolean(connection.pageInfo?.hasNextPage);
      after = connection.pageInfo?.endCursor ?? null;
    }

    catalogCache = { expires: Date.now() + CATALOG_TTL_MS, products: collected };
    return collected;
  } catch (error) {
    console.error("Shopify getAllProducts failed:", error);
    return collected.length ? collected : [];
  }
};

export const getCatalogGroups = async (options: { buyerIP: string }) => {
  const products = await getAllProducts(options);
  const groups = Object.fromEntries(
    catalogCategories.map((category) => [category.slug, [] as ListedProduct[]])
  ) as Record<CatalogSlug, ListedProduct[]>;

  for (const product of products) {
    groups[categorySlugForType(product.productType)].push(product);
  }

  return groups;
};

export const PAGE_SIZE = 24;

export const getCategoryPage = async (options: {
  slug: CatalogSlug;
  buyerIP: string;
  page?: number;
  pageSize?: number;
}) => {
  const pageSize = options.pageSize ?? PAGE_SIZE;
  const page = Math.max(1, options.page ?? 1);
  const groups = await getCatalogGroups({ buyerIP: options.buyerIP });
  const items = groups[options.slug] ?? [];
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    totalPages,
    pageSize,
  };
};

// Get a product by its handle (slug)
export const getProductByHandle = async (options: {
  handle: string;
  buyerIP: string;
}) => {
  const { handle, buyerIP } = options;

  try {
    const data = await makeShopifyRequest(
      ProductByHandleQuery,
      { handle },
      buyerIP
    );
    const { product } = data;
    return ProductResult.parse(product ?? null);
  } catch (error) {
    console.error("Shopify getProductByHandle failed:", error);
    return null;
  }
};

export const getProductRecommendations = async (options: {
  productId: string;
  buyerIP: string;
}) => {
  const { productId, buyerIP } = options;
  try {
    const data = await makeShopifyRequest(
      ProductRecommendationsQuery,
      {
        productId,
      },
      buyerIP
    );
    const { productRecommendations } = data;
    const ProductsResult = z.array(ProductResult);
    return ProductsResult.parse(productRecommendations ?? []);
  } catch (error) {
    console.error("Shopify getProductRecommendations failed:", error);
    return [];
  }
};

// Create a cart and add a line item to it and return the cart object
export const createCart = async (id: string, quantity: number) => {
  const data = await makeShopifyRequest(CreateCartMutation, { id, quantity });
  const { cartCreate } = data;
  const { cart } = cartCreate;
  const parsedCart = CartResult.parse(cart);

  return parsedCart;
};

// Add a line item to an existing cart (by ID) and return the updated cart object
export const addCartLines = async (
  id: string,
  merchandiseId: string,
  quantity: number
) => {
  const data = await makeShopifyRequest(AddCartLinesMutation, {
    cartId: id,
    merchandiseId,
    quantity,
  });
  const { cartLinesAdd } = data;
  const { cart } = cartLinesAdd;

  const parsedCart = CartResult.parse(cart);

  return parsedCart;
};

// Remove line items from an existing cart (by IDs) and return the updated cart object
export const removeCartLines = async (id: string, lineIds: string[]) => {
  const data = await makeShopifyRequest(RemoveCartLinesMutation, {
    cartId: id,
    lineIds,
  });
  const { cartLinesRemove } = data;
  const { cart } = cartLinesRemove;
  const parsedCart = CartResult.parse(cart);

  return parsedCart;
};

// Get a cart by its ID and return the cart object
export const getCart = async (id: string) => {
  const data = await makeShopifyRequest(GetCartQuery, { id });

  const { cart } = data;
  const parsedCart = CartResult.parse(cart);

  return parsedCart;
};
