import { useCartData, useAddToCart, useRemoveFromCart as useRemoveFromCartHook } from "./useApi";

export function useCart() {
  const { data, isLoading, error } = useCartData();
  const addToCart = useAddToCart();
  const removeFromCart = useRemoveFromCartHook();

  return {
    cart: data?.cart || { items: [] },
    isLoading,
    error,
    addToCart,
    removeFromCart,
    itemCount: data?.cart?.items?.length || 0,
  };
}
